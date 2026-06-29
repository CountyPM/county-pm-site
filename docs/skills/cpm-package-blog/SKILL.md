---
name: cpm-package-blog
description: Package the current conversation into a County Property Management blog contract file (cpm-blog_<slug>.md) for the CPM blog pipeline. Trigger when the user types "/blog", says "package this as a blog", or asks to send content to the CPM blog. Emits the exact contract that scripts/post-blog.mjs consumes.
---

# CPM Package Blog

This is the **executing** surface of the blog capture contract (Track D). It mirrors,
byte-for-byte, the contract format in `docs/CPM_Blog_Capture_Preferences.md` (the
iPhone/preferences surface). Keep the two in sync — they are one contract, two surfaces.

In Cowork/Code you can write the file directly; on iPhone the preferences entry produces
the same text for the user to email. Either way the downstream PC stage
(`scripts/post-blog.mjs`) is identical.

## When to use — packaging only, never during creative work

Keep two phases separate:

- **Creative phase (default).** When the user raises a blog topic or asks you to write,
  draft, explore, or brainstorm a blog — even "create a blog about X" — collaborate in
  normal prose. Do NOT emit the contract format; don't let the template constrain ideas.
- **Packaging phase (only on the exact `/blog` command).** Produce the contract file ONLY
  when the user types `/blog`. That is the sole trigger. ("Package this as a CPM blog" is
  an acceptable equivalent, but a bare request to "write a blog" is NOT — that's creative.)

## What to produce

A single Markdown contract file named `cpm-blog_<slug>.md` (the `<slug>` is just a working
filename — the PC stage generates the real slug). Write it to the blog inbox folder if one
is configured locally; otherwise present its contents for the user to send.

### Exact format

```
---
type: blog
campaign_id: null
slug: null
title: "<headline>"
subtitle: "<one-sentence deck/subtitle>"
byline: "By Richard J. Miller · Founder, County Property Management · California Broker since 1995"
decision_intent: [<one or more of: selling, renting, holding, still-deciding>]
tags: [<zero or more of: blog_lead, lead_magnet, contact_form, strategy_session, owner_lead>]
publish_date: null
status: ready
source_chat_context: "<1-2 sentences of provenance; may hold private context — NEVER published, archived privately>"
gemini_prompt: "<vivid hero-image generation prompt>"
faq_included: <true|false>
---

<full article body in Markdown — clean H2/H3 hierarchy, each section leads with its point>

---FAQ---

Q: <question>
A: <direct answer first, then expand>
```

## Rules (must hold — post-blog.mjs depends on them)

- Leave `type`, `campaign_id`, `slug`, `publish_date`, `status` exactly as shown. The PC
  stage fills `slug`/`publish_date`, derives `category`, and classifies FAQs.
- `status: ready` is required or the PC stage refuses the file.
- `decision_intent` ∈ {selling, renting, holding, still-deciding}. `tags` ⊆ {blog_lead,
  lead_magnet, contact_form, strategy_session, owner_lead}. Invent no new values.
- `category` is NOT in the contract — it is derived by the PC stage from
  `decision_intent` + `tags`. Do not add it.
- Include `---FAQ---` only when `faq_included: true`; 3–6 strong Q&As, answer-first.
- **Privacy:** any client/tenant/deal specifics go ONLY in `source_chat_context`. The PC
  stage hard-fails if `source_chat_context` or `gemini_prompt` ever appear in the published
  frontmatter, so never place private detail in `title`, `subtitle`, or the body.

## Handoff

- iPhone: the user copies the block and emails it to the blog inbox (`cpmblog93012@gmail.com`);
  the runner harvests it.
- Cowork/Code on the PC: write `cpm-blog_<slug>.md` into `./incoming/`, then the runner (or a
  direct `node scripts/post-blog.mjs ./incoming/<file> --sidecar-dir ./.blog-processed`)
  converts and commits it. Add `--publish` to go live.

Format authority: `docs/CPM_Blog_FieldMapping_Spec.md`. Pipeline overview: `docs/CPM_Blog_Capture_Handoff_TrackD.md`.
