#!/usr/bin/env node
/**
 * harvest-blog-inbox.mjs — CPM blog capture, email bridge (Track D).
 *
 * The iPhone half of the pipeline emails a packaged contract (Handoff §3.3,
 * format authority docs/CPM_Blog_FieldMapping_Spec.md) to a dedicated mailbox.
 * This script is the seam: it logs into that mailbox over IMAP, pulls UNSEEN
 * messages from approved senders, extracts the `cpm-blog_<slug>.md` contract
 * (attachment preferred, else the email body), and drops each one into the
 * local inbox folder so post-blog.mjs can convert + publish it.
 *
 * It does NOT need a desktop mail client — IMAP talks straight to the server.
 *
 * SAFE BY DEFAULT:
 *   - Processes ONLY mail from addresses in ALLOWED_SENDERS (anti-injection:
 *     the runner auto-commits, so untrusted senders must never reach it).
 *   - Writes contract files locally only; never commits, never pushes.
 *   - Marks a message \Seen only after it has been handled, so nothing is lost
 *     on a crash and nothing is processed twice.
 *
 * Config lives in .env.blog-inbox at the repo root (gitignored). See
 * .env.blog-inbox.sample. Env vars override file values.
 *
 * Usage:
 *   node scripts/harvest-blog-inbox.mjs [--inbox <dir>] [--dry-run]
 *
 *   --inbox <dir>   Where to write contract files (default ./incoming)
 *   --dry-run       Connect + report what would be harvested; write nothing,
 *                   mark nothing seen.
 *
 * Exit codes: 0 = ok (including "nothing new"); 1 = config/connection error.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}
const info = (msg) => console.log(`  ${msg}`)

// ---------- arg parsing ----------
function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') opts['dry-run'] = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// ---------- config (.env.blog-inbox, KEY=VALUE; env vars win) ----------
function loadConfig() {
  const cfg = {}
  const envPath = path.join(REPO_ROOT, '.env.blog-inbox')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      cfg[key] = val
    }
  }
  const get = (k, d) => process.env[k] ?? cfg[k] ?? d
  return {
    host: get('CPM_IMAP_HOST', 'imap.gmail.com'),
    port: Number(get('CPM_IMAP_PORT', '993')),
    user: get('CPM_IMAP_USER'),
    pass: get('CPM_IMAP_PASS'),
    mailbox: get('CPM_IMAP_MAILBOX', 'INBOX'),
    allowed: String(get('CPM_ALLOWED_SENDERS', ''))
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  }
}

// ---------- contract extraction ----------
const BEGIN = '-----BEGIN CPM BLOG-----'
const END = '-----END CPM BLOG-----'

// Pull EVERY BEGIN/END-delimited block out of a chunk of text. A single email
// body can stack multiple contracts (the /blog fan-out), so we walk all pairs
// rather than just the first. If no sentinels are present, the whole chunk is
// treated as one candidate (back-compat with single-post plain-text emails).
function splitSentinelBlocks(text) {
  if (!text) return []
  const out = []
  let from = 0
  while (true) {
    const b = text.indexOf(BEGIN, from)
    if (b === -1) break
    const e = text.indexOf(END, b + BEGIN.length)
    if (e === -1) break
    out.push(text.slice(b + BEGIN.length, e).trim())
    from = e + END.length
  }
  if (out.length === 0) return [text.trim()]
  return out
}

// Pull ALL contract texts out of a parsed email, as an array. One email may
// carry several posts: across multiple .md/.txt attachments AND/OR multiple
// stacked sentinel blocks in the body. Attachments are preferred when present
// (each attachment may itself stack blocks); otherwise we fan out the body.
function extractContracts(parsed) {
  const atts = parsed.attachments || []
  const mdAtts = atts.filter((a) => /\.(md|txt)$/i.test(a.filename || '') && a.content)
  if (mdAtts.length) {
    // Sort cpm-blog*.md first for stable, predictable ordering.
    mdAtts.sort((a, b) => {
      const ar = /cpm-blog/i.test(a.filename || '') ? 0 : 1
      const br = /cpm-blog/i.test(b.filename || '') ? 0 : 1
      return ar - br
    })
    return mdAtts.flatMap((a) => splitSentinelBlocks(a.content.toString('utf8')))
  }
  return splitSentinelBlocks(parsed.text || '')
}

// A real contract starts with a YAML frontmatter block containing a title.
function looksLikeContract(s) {
  if (!s) return false
  const fmEnd = s.indexOf('\n---', 3)
  if (!s.startsWith('---') || fmEnd === -1) return false
  return /\btitle:\s*\S/.test(s.slice(0, fmEnd + 4))
}

function sanitizeSlugPart(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// Exported for unit testing (test harness imports these without running main).
export { splitSentinelBlocks, extractContracts, looksLikeContract, sanitizeSlugPart }

// ---------- main ----------
async function run() {
const opts = parseArgs(process.argv.slice(2))
const cfg = loadConfig()
const dryRun = Boolean(opts['dry-run'])

if (!cfg.user || !cfg.pass)
  fail(
    'Missing IMAP credentials. Set CPM_IMAP_USER and CPM_IMAP_PASS in .env.blog-inbox\n' +
      '  (copy .env.blog-inbox.sample). The password is a Gmail App Password, not the login password.'
  )
if (cfg.allowed.length === 0)
  fail(
    'CPM_ALLOWED_SENDERS is empty. Refusing to harvest from any sender (anti-injection).\n' +
      '  Add your own address(es), comma-separated, to .env.blog-inbox.'
  )

const inboxDir = path.resolve(opts.inbox || path.join(REPO_ROOT, 'incoming'))
fs.mkdirSync(inboxDir, { recursive: true })

console.log(`\nCPM harvest-blog-inbox — ${cfg.user} @ ${cfg.host}${dryRun ? '  (dry-run)' : ''}`)
info(`allowed senders: ${cfg.allowed.join(', ')}`)
info(`inbox dir:       ${inboxDir}`)

const client = new ImapFlow({
  host: cfg.host,
  port: cfg.port,
  secure: true,
  auth: { user: cfg.user, pass: cfg.pass },
  logger: false,
})

let harvested = 0
let skipped = 0

try {
  await client.connect()
} catch (e) {
  fail(`IMAP connect/login failed: ${e.message}\n  (Check the App Password and that 2-Step Verification is on.)`)
}

const lock = await client.getMailboxLock(cfg.mailbox)
try {
  const uids = await client.search({ seen: false })
  if (!uids || uids.length === 0) {
    console.log('\n✓ No new mail.\n')
  } else {
    info(`\n${uids.length} unseen message(s) to inspect`)
    // Collect UIDs to mark \Seen AFTER the fetch completes — issuing an IMAP
    // command (messageFlagsAdd) while a fetch is still iterating is not allowed.
    const seenUids = []
    // Names already used this run (covers dry-run, where files aren't written
    // yet, and same-stem posts within a single batch).
    const reserved = new Set()
    for await (const msg of client.fetch({ seen: false }, { uid: true, source: true })) {
      const parsed = await simpleParser(msg.source)
      const from = (parsed.from?.value?.[0]?.address || '').toLowerCase()
      const subject = parsed.subject || '(no subject)'

      if (!cfg.allowed.includes(from)) {
        skipped++
        info(`  • skip (sender not allowed): ${from || '?'} — "${subject}"`)
        seenUids.push(msg.uid)
        continue
      }

      // One message can carry several posts (the /blog fan-out). Pull every
      // candidate, keep the valid contracts, and write one file per post.
      const contracts = extractContracts(parsed).filter(looksLikeContract)
      if (contracts.length === 0) {
        skipped++
        info(`  • skip (no valid contract found): "${subject}"`)
        seenUids.push(msg.uid)
        continue
      }
      info(`  • "${subject}" — ${contracts.length} contract(s)`)

      for (const contract of contracts) {
        const titleMatch = contract.match(/\btitle:\s*["']?([^"'\n]+)/i)
        const stem =
          sanitizeSlugPart(titleMatch?.[1]) ||
          sanitizeSlugPart(subject) ||
          new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')
        let fileName = `cpm-blog_${stem}.md`
        let dest = path.join(inboxDir, fileName)
        let n = 2
        while (reserved.has(fileName) || fs.existsSync(dest)) {
          fileName = `cpm-blog_${stem}-${n++}.md`
          dest = path.join(inboxDir, fileName)
        }
        reserved.add(fileName)

        if (dryRun) {
          info(`    - would harvest → ${fileName}`)
        } else {
          fs.writeFileSync(dest, contract.endsWith('\n') ? contract : contract + '\n')
          info(`    - harvested → ${fileName}`)
        }
        harvested++
      }
      // Mark the message seen once, after all its posts are handled.
      seenUids.push(msg.uid)
    }

    // Now that the fetch has finished, mark everything we handled as \Seen.
    if (!dryRun && seenUids.length) {
      await client.messageFlagsAdd(seenUids.join(','), ['\\Seen'], { uid: true })
    }
  }
} finally {
  lock.release()
  await client.logout()
}

console.log(`\n✓ harvest done — ${harvested} contract(s)${dryRun ? ' (dry-run, nothing written)' : ''}, ${skipped} skipped.\n`)
}

// Run as a CLI only when invoked directly (not when imported by a test).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}
