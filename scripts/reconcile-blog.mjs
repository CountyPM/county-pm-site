#!/usr/bin/env node
/**
 * reconcile-blog.mjs - dedup the free-account pulls against the CPM blog corpus.
 * Corpus = live (content/blog/*.mdx) + backlog (backlog-routing) + processed (.blog-processed).
 * For each confirmed chat pull, find the closest corpus docs by salient-term overlap and
 * title match, assign a verdict (EXACT-DUP / LIKELY-DUP / REVIEW / NEW), and write one
 * review packet per pull to content/blog-reconcile/. Detect only - publishes nothing.
 */
import fs from 'node:fs'
import path from 'node:path'

const KEEP = [17, 18, 21, 27, 30, 32, 37, 40, 43, 46, 47, 51, 54, 55]
const OUT = 'content/blog-reconcile'
fs.mkdirSync(OUT, { recursive: true })

const STOP = new Set('the a an and or but for nor so yet of to in on at by with from into over under about as is are was were be been being it its this that these those you your yours we our i he she they them his her their what which who whom when where why how not no yes if then than out up down off can will would should could may might must do does did have has had get got make makes made more most some any all each every much many will just like also because while during before after between only own same other another new now here there'.split(' '))

function tokens(t) {
  return (t.toLowerCase().match(/[a-z][a-z']{3,}/g) || []).filter(w => !STOP.has(w))
}
function salient(t, k) {
  const f = {}
  for (const w of tokens(t)) f[w] = (f[w] || 0) + 1
  return new Set(Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, k || 45).map(e => e[0]))
}
function overlapCoef(a, b) {
  if (!a.size || !b.size) return 0
  let n = 0
  for (const x of a) if (b.has(x)) n++
  return n / Math.min(a.size, b.size)
}
function titleTokens(t) { return new Set(tokens(t || '')) }
function stripHtml(s) { return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ') }
function frontTitle(s) {
  const m = s.match(/^title:\s*["']?(.+?)["']?\s*$/m) || s.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : null
}

// ---- build corpus ----
const corpus = []
for (const f of fs.readdirSync('content/blog').filter(f => f.endsWith('.mdx'))) {
  const s = fs.readFileSync(path.join('content/blog', f), 'utf8')
  corpus.push({ src: 'LIVE', file: 'content/blog/' + f, title: frontTitle(s) || f, terms: salient(s), ttok: titleTokens(frontTitle(s) || f) })
}
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) }
for (const f of walk('backlog-routing')) {
  if (!/\.(md|html|txt)$/i.test(f)) continue
  let s = fs.readFileSync(f, 'utf8')
  if (/\.html$/i.test(f)) s = stripHtml(s)
  corpus.push({ src: 'BACKLOG', file: f, title: frontTitle(s) || path.basename(f), terms: salient(s), ttok: titleTokens(frontTitle(s) || path.basename(f)) })
}
for (const f of fs.readdirSync('.blog-processed').filter(f => f.endsWith('.md'))) {
  const s = fs.readFileSync(path.join('.blog-processed', f), 'utf8')
  corpus.push({ src: 'PROCESSED', file: '.blog-processed/' + f, title: frontTitle(s) || f, terms: salient(s), ttok: titleTokens(frontTitle(s) || f) })
}

// ---- build pulls (all assistant prose per chat) ----
const data = JSON.parse(fs.readFileSync('conversations.json', 'utf8'))
const BT = String.fromCharCode(96)
const FENCE = new RegExp('^' + BT + '{3}[a-z]*\\s*$', 'gim')
function textOf(m) {
  const t = (m.text && m.text.trim()) ? m.text : (Array.isArray(m.content) ? m.content.map(c => c.text || '').join('\n') : '')
  return t.replace(FENCE, '')
}
function firstTitle(t) {
  const m = t.match(/^#{1,3}\s+(.+)$/m) || t.match(/^\*\*([^*]{6,80})\*\*\s*$/m)
  return m ? m[1].trim() : null
}

const rows = []
for (const idx of KEEP) {
  const conv = data[idx]
  const msgs = conv.chat_messages || []
  const asst = msgs.filter(m => m.sender === 'assistant').map(textOf).filter(t => t.length > 300)
  const blob = asst.join('\n\n')
  const pTitle = asst.map(firstTitle).find(Boolean) || conv.name
  const pTerms = salient(blob, 60)
  const pTtok = titleTokens(pTitle)
  const scored = corpus.map(c => {
    const term = overlapCoef(pTerms, c.terms)
    const title = (pTtok.size >= 4 && c.ttok.size >= 4) ? overlapCoef(pTtok, c.ttok) : 0
    return { c, term, title, score: Math.max(term, title * 0.9) + title * 0.15 }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
  const top = scored[0]
  let verdict = 'NEW'
  if (top) {
    if (top.term >= 0.50) verdict = 'EXACT-DUP'
    else if (top.term >= 0.40 || (top.term >= 0.30 && top.title >= 0.50)) verdict = 'LIKELY-DUP'
    else if (top.term >= 0.30) verdict = 'REVIEW'
  }
  rows.push({ idx, chat: conv.name, pTitle, verdict, top: scored })

  const lines = []
  lines.push('---')
  lines.push('type: blog-reconcile')
  lines.push('source_chat_idx: ' + idx)
  lines.push('source_chat_name: "' + conv.name.replace(/"/g, "'") + '"')
  lines.push('pull_title: "' + String(pTitle).replace(/"/g, "'") + '"')
  lines.push('verdict: ' + verdict)
  lines.push('status: needs-human-confirm')
  lines.push('matches:')
  for (const s of scored) {
    lines.push('  - file: "' + s.c.file + '"')
    lines.push('    src: ' + s.c.src)
    lines.push('    title: "' + String(s.c.title).replace(/"/g, "'").slice(0, 90) + '"')
    lines.push('    term_overlap: ' + s.term.toFixed(2))
    lines.push('    title_overlap: ' + s.title.toFixed(2))
  }
  lines.push('---')
  lines.push('')
  lines.push('Verdict ' + verdict + ' for chat #' + idx + ' ("' + conv.name + '").')
  lines.push('Closest corpus match: ' + (top ? top.c.file + '  [term ' + top.term.toFixed(2) + ' / title ' + top.title.toFixed(2) + ']' : 'none') + '.')
  lines.push('')
  lines.push('Confirm: set status to confirmed-new (package it) or confirmed-dup (drop; note which file it duplicates).')
  const slug = String(conv.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55)
  fs.writeFileSync(path.join(OUT, String(idx).padStart(2, '0') + '-' + slug + '.md'), lines.join('\n'))
}

rows.sort((a, b) => a.verdict.localeCompare(b.verdict))
console.log('Corpus: ' + corpus.length + ' docs (live+backlog+processed)\n')
console.log('idx  verdict     term title  closest match                              chat')
for (const r of rows) {
  const t = r.top[0]
  console.log(
    String(r.idx).padStart(3),
    r.verdict.padEnd(11),
    (t ? t.term.toFixed(2) : '-').padStart(4),
    (t ? t.title.toFixed(2) : '-').padStart(5),
    ' ',
    (t ? path.basename(t.c.file).slice(0, 40) : '-').padEnd(42),
    r.chat.slice(0, 34)
  )
}
console.log('\nPackets -> ' + OUT + '  (' + rows.length + ' files)')
