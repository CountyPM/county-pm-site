#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const KEEP = [17, 18, 21, 27, 30, 32, 37, 40, 43, 46, 47, 51, 54, 55]
const data = JSON.parse(fs.readFileSync('conversations.json', 'utf8'))
const OUT = 'incoming/from-free-chats'
fs.mkdirSync(path.join(OUT, 'drafts'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'transcripts'), { recursive: true })

const BT = String.fromCharCode(96)
const FENCE = new RegExp('^' + BT + '{3}[a-z]*\\s*$', 'gim')
const CRUFT = /^(this block is not supported on your current device.*|copy|edit|retry|share|regenerate)\s*$/i

function rawText(m) {
  if (m.text && m.text.trim()) return m.text
  if (Array.isArray(m.content)) return m.content.map(c => c.text || '').join('\n')
  return ''
}
function textOf(m) {
  return rawText(m).replace(FENCE, '').split('\n').filter(l => !CRUFT.test(l.trim())).join('\n')
}
function slugify(s) {
  return (s || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

const SCAFFOLD = /^(structure|publishing suggestions?|option \d|for web crawling|which blog|seo|outline|suggestions?|notes?|version [ab]|approach \d)\b/i
const LEADIN = /^(let me|there are|this is|good|got it|here|both|okay|sure|great|nice)\b/i

function firstTitle(t) {
  const lines = t.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 8)
  for (const l of lines) {
    let m = l.match(/^#{1,3}\s+(.+)$/)
    if (m) return m[1].trim()
    m = l.match(/^\*\*([^*]{4,90})\*\*$/)
    if (m) return m[1].trim()
    m = l.match(/^([A-Z][A-Za-z0-9 ,.\-]{10,80})$/)
    if (m && !l.endsWith(':') && !LEADIN.test(l)) return m[1].trim()
  }
  return null
}
function proseScore(t) {
  const paras = t.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  const meaty = paras.filter(p => p.length > 180 && !p.startsWith('-') && !p.startsWith('*') && !/^\d+\./.test(p))
  const bullets = paras.filter(p => /^[-*]|^\d+\./.test(p)).length
  const bulletRatio = paras.length ? bullets / paras.length : 0
  return { meaty: meaty.length, bulletRatio, paras: paras.length }
}

const index = []
for (const idx of KEEP) {
  const conv = data[idx]
  const msgs = conv.chat_messages || []
  const candidates = []
  msgs.forEach((m, i) => {
    if (m.sender !== 'assistant') return
    const t = textOf(m).trim()
    if (t.length < 500) return
    if (SCAFFOLD.test(t)) return
    const ps = proseScore(t)
    if (ps.meaty < 1 || ps.bulletRatio > 0.6) return
    const title = firstTitle(t)
    const score = ps.meaty * 40 + Math.min(t.length, 8000) / 100 + (i / msgs.length) * 30 + (title ? 25 : 0)
    candidates.push({ i, len: t.length, title, score: Math.round(score), text: t })
  })
  candidates.sort((a, b) => b.score - a.score)
  const best = candidates[0]
  const slug = slugify(best && best.title ? best.title : conv.name)
  const base = String(idx).padStart(2, '0') + '-' + slug
  const alts = candidates.slice(1).map(c => '#' + c.i + '(' + c.len + 'c)').join(', ') || 'none'
  const turn = best ? best.i : '-'
  const blen = best ? best.len : 0
  const header = '<!-- SOURCE chat #' + idx + ' "' + conv.name + '" | turn ' + turn + '/' + msgs.length + ' | ' + blen + ' chars | alts: ' + alts + ' -->\n\n'
  fs.writeFileSync(path.join(OUT, 'drafts', base + '.md'), header + (best ? best.text : '(no article-like draft found)'))
  const tr = msgs.map(m => '\n===== ' + m.sender.toUpperCase() + ' =====\n' + textOf(m).trim()).join('\n')
  fs.writeFileSync(path.join(OUT, 'transcripts', base + '.txt'), 'CHAT #' + idx + ': ' + conv.name + '\n' + tr)
  index.push({ idx, name: conv.name, slug, file: 'drafts/' + base + '.md', chosenTurn: best ? best.i : null, chosenLen: blen, chosenTitle: best && best.title ? best.title : null, alt: candidates.length - 1 })
}

fs.writeFileSync(path.join(OUT, 'pulls-index.json'), JSON.stringify(index, null, 2))
console.log('idx  len    alts  title / slug')
for (const r of index) {
  console.log(String(r.idx).padStart(3), String(r.chosenLen).padStart(6), String(r.alt).padStart(4), ' ', (r.chosenTitle ? '"' + r.chosenTitle.slice(0, 52) + '"' : '(no title) ' + r.slug))
}
console.log('\n' + index.length + ' drafts written to ' + OUT)
