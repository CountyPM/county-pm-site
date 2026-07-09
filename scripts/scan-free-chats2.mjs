#!/usr/bin/env node
/**
 * scan-free-chats2.mjs — sharper pass. For each chat, find the HUMAN turns that
 * explicitly ask to write/draft/rewrite a blog/post/article/field-note, and pair
 * each with the title/first heading of the assistant draft that follows. Prints the
 * actual request sentence so a human can confirm — no scoring guesswork.
 */
import fs from 'node:fs'
const data = JSON.parse(fs.readFileSync('conversations.json', 'utf8'))

const INTENT = /\b(write|draft|rewrite|re-?write|revise|turn (?:this|it|that) into|make (?:this|it) (?:a|into)|blog post|blog entry|a blog|blog about|an article|a (?:new )?post|field note|newsletter)\b/i
const PUBLISHY = /\b(blog|article|post|field note|newsletter|essay|piece)\b/i
const textOf = (m) => (m.text && m.text.trim()) ? m.text : (Array.isArray(m.content) ? m.content.map(c => c.text || '').join('\n') : '')
const firstHeading = (t) => {
  const h = t.match(/^#{1,3}\s+(.+)$/m) || t.match(/^\*\*([^*]{4,80})\*\*\s*$/m) || t.match(/^([A-Z][A-Z0-9 ,.'":\-]{8,70})$/m)
  return h ? h[1].trim().slice(0, 70) : null
}

const hits = []
for (const conv of data) {
  const msgs = conv.chat_messages || []
  const intentTurns = []
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]
    if (m.sender !== 'human') continue
    const t = textOf(m)
    if (INTENT.test(t) && PUBLISHY.test(t)) {
      // grab a following assistant draft
      let draftTitle = null, draftLen = 0
      for (let j = i + 1; j < Math.min(i + 3, msgs.length); j++) {
        if (msgs[j].sender === 'assistant') {
          const at = textOf(msgs[j])
          if (at.length > draftLen) { draftLen = at.length; draftTitle = firstHeading(at) }
        }
      }
      const req = t.replace(/\s+/g, ' ').trim()
      intentTurns.push({ req: req.slice(0, 160), draftTitle, draftLen })
    }
  }
  if (intentTurns.length) hits.push({ idx: data.indexOf(conv), name: conv.name, msgs: msgs.length, intentTurns })
}

for (const h of hits) {
  console.log(`\n#${h.idx}  ${h.name}  (${h.msgs} msgs, ${h.intentTurns.length} blog-request turn${h.intentTurns.length>1?'s':''})`)
  for (const it of h.intentTurns) {
    console.log(`   ⟶ req: "${it.req}"`)
    console.log(`     draft: ${it.draftTitle ? '“'+it.draftTitle+'”' : '(no clear heading)'}  [${it.draftLen} chars]`)
  }
}
console.log(`\n${hits.length} of ${data.length} chats have an explicit blog/article writing request.`)
fs.writeFileSync('incoming/from-free-chats/blog-intent.json', JSON.stringify(hits, null, 2))
