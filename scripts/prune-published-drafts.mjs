#!/usr/bin/env node
/**
 * prune-published-drafts.mjs — queue hygiene for the CPM FAQ write pipeline.
 *
 * Root cause of the recurring "07/02 stall" (see docs/CPM_Decision_Log.md,
 * 2026-07-09): drafts in content/faq-drafts/ were never removed after being
 * authored + promoted to content/faq/. The heartbeat counts the draft queue, so
 * already-published dupes accumulated (5 -> 84 -> 106) and kept re-firing the
 * ⚠ "N drafts queued" alert even though the work was done. On 2026-07-09, 57 of
 * 106 queued drafts were already live.
 *
 * This script removes that inflation: any content/faq-drafts/<slug>.md whose slug
 * already exists in content/faq/ has been promoted, so it is moved out of the
 * top-level queue (into content/faq-drafts/_promoted/ by default — non-destructive)
 * or deleted with --delete.
 *
 * Safe to run on every publish: it only touches drafts whose answer is already
 * live. Reports by default; pass --apply to actually move (or --delete to remove).
 *
 * Usage:
 *   node scripts/prune-published-drafts.mjs            # report only
 *   node scripts/prune-published-drafts.mjs --apply    # move promoted drafts to _promoted/
 *   node scripts/prune-published-drafts.mjs --apply --delete   # delete them instead
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')
const DRAFTS_DIR = path.join(REPO_ROOT, 'content/faq-drafts')

const opts = { apply: false, delete: false, quiet: false }
for (const a of process.argv.slice(2)) {
  if (a === '--apply') opts.apply = true
  else if (a === '--delete') opts.delete = true
  else if (a === '--quiet') opts.quiet = true
}

const mdSlugs = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : []

const liveSlugs = new Set(mdSlugs(FAQ_DIR))
const draftSlugs = mdSlugs(DRAFTS_DIR)
const promoted = draftSlugs.filter((s) => liveSlugs.has(s))

if (!opts.quiet) {
  console.log(`\nprune-published-drafts`)
  console.log(`  live hub entries      ${liveSlugs.size}`)
  console.log(`  drafts in queue       ${draftSlugs.length}`)
  console.log(`  already-published     ${promoted.length}${opts.apply ? '' : ' (report only — pass --apply to clear)'}`)
}

if (!promoted.length) {
  if (!opts.quiet) console.log(`  queue is clean — nothing to prune.\n`)
  process.exit(0)
}

let moved = 0
if (opts.apply) {
  const dest = path.join(DRAFTS_DIR, '_promoted')
  if (!opts.delete && !fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const slug of promoted) {
    const src = path.join(DRAFTS_DIR, `${slug}.md`)
    try {
      if (opts.delete) fs.rmSync(src)
      else fs.renameSync(src, path.join(dest, `${slug}.md`))
      moved++
    } catch (e) {
      console.error(`  ! could not ${opts.delete ? 'delete' : 'move'} ${slug}.md: ${e.message}`)
    }
  }
  if (!opts.quiet)
    console.log(`  ${opts.delete ? 'deleted' : 'moved to content/faq-drafts/_promoted/'}: ${moved}\n`)
} else if (!opts.quiet) {
  for (const s of promoted.slice(0, 20)) console.log(`    • ${s}`)
  if (promoted.length > 20) console.log(`    … and ${promoted.length - 20} more`)
  console.log('')
}

process.exit(0)
