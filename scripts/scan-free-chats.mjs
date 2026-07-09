#!/usr/bin/env node
/**
 * scan-free-chats.mjs — first pass over a claude.ai data export (conversations.json)
 * to find chats that plausibly contain a CPM BLOG DRAFT. It DETECTS + SCORES only;
 * it packages nothing and de-dupes nothing (that's reconcile-blog, later). Output is
 * a ranked report for a human to confirm which chats are real blog material.
 *
 * Signals per conversation (summed into a score):
 *   +100  contains a CPM contract sentinel (-----BEGIN CPM BLOG-----)  → already packaged
 *   +40   a human turn explicitly asks to write/draft/rewrite a blog/post/article
 *   +  n  each assistant turn that looks like long-form article prose
 *          (>= 1200 chars AND has markdown headings or multiple paragraphs)
 *   +10   CPM/real-estate topical density (landlord/tenant/rental/Ventura/rent control...)
 * Chats about other businesses (e.g. a fishing-lure blog) score topical 0 and are
 * flagged NON-CPM if they trip blog-intent for a non-CPM subject.
 *
 * Usage: node scripts/scan-free-chats.mjs [conversations.json] [--out incoming/from-free-chats]
 */
import fs from 'node:fs'
import path from 'node:path'

const SRC = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'conversations.json'
const outIdx = process.argv.indexOf('--out')
const OUT = outIdx > -1 ? process.argv[outIdx + 1] : 'incoming/from-free-chats'
fs.mkdirSync(OUT, { recursive: true })

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'))

const CPM_TERMS = /\b(landlord|tenant|rental|renter|lease|eviction|rent control|property manage|ventura|oxnard|camarillo|habitability|security deposit|owner|vacancy|CPM|county property)\b/gi
const OTHER_BIZ = /\b(fishing|lure|hot ticket|monopoly game|valentine|father'?s day|plaque|photo itinerary|monterey|moss landing|stock pick)\b/gi
const BLOG_INTENT = /\b(write|draft|rewrite|revis|turn (this|it) into|blog post|blog entry|a blog|an article|a post|newsletter|field note)\b/i
const HEADING = /^#{1,3}\s+\S|^\*\*[^*]+\*\*\s*$/m

const textOf = (m) => {
  if (m.text && m.text.trim()) return m.text
  if (Array.isArray(m.content)) return m.content.map(c => c.text || '').join('\n')
  return ''
}

const rows = []
for (const conv of data) {
  const msgs = conv.chat_messages || []
  if (!msgs.length) continue
  const all = msgs.map(textOf).join('\n')
  const humanText = msgs.filter(m => m.sender === 'human').map(textOf).join('\n')
  const asst = msgs.filter(m => m.sender === 'assistant').map(textOf)

  const cpmHits = (all.match(CPM_TERMS) || []).length
  const otherHits = (all.match(OTHER_BIZ) || []).length
  const hasSentinel = all.includes('-----BEGIN CPM BLOG-----')
  const blogIntent = BLOG_INTENT.test(humanText)

  // article-like assistant turns
  const drafts = asst.filter(t => t.length >= 1200 && (HEADING.test(t) || (t.split(/\n\n+/).length >= 4)))
  const longestDraft = drafts.reduce((a, t) => Math.max(a, t.length), 0)

  let score = 0
  if (hasSentinel) score += 100
  if (blogIntent) score += 40
  score += drafts.length * 15
  if (cpmHits >= 3) score += 10

  const nonCpm = otherHits > cpmHits && blogIntent
  if (nonCpm) score -= 60

  rows.push({
    idx: data.indexOf(conv),
    uuid: conv.uuid,
    name: conv.name || '(untitled)',
    msgs: msgs.length,
    updated: (conv.updated_at || '').slice(0, 10),
    cpmHits, otherHits, hasSentinel, blogIntent,
    draftCount: drafts.length, longestDraft,
    nonCpm,
    score,
  })
}

rows.sort((a, b) => b.score - a.score)
fs.writeFileSync(path.join(OUT, 'scan-report.json'), JSON.stringify(rows, null, 2))

const tier = (r) => r.score >= 100 ? 'PACKAGED' : r.score >= 55 ? 'STRONG' : r.score >= 30 ? 'MAYBE' : r.nonCpm ? 'NON-CPM' : 'weak'
const pad = (s, n) => String(s).padEnd(n)
console.log(pad('sc', 4), pad('tier', 9), pad('idx', 4), pad('msgs', 5), pad('drafts', 7), pad('longest', 8), 'name')
for (const r of rows) {
  if (r.score < 30 && !r.nonCpm) continue
  console.log(
    pad(r.score, 4), pad(tier(r), 9), pad(r.idx, 4), pad(r.msgs, 5),
    pad(r.draftCount, 7), pad(r.longestDraft, 8),
    r.name.slice(0, 60) + (r.nonCpm ? '  [non-CPM subject]' : '') + (r.hasSentinel ? '  [has contract]' : '')
  )
}
console.log(`\n${rows.length} chats scanned · report → ${path.join(OUT, 'scan-report.json')}`)
