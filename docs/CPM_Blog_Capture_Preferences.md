# CPM Blog Capture — Claude Preferences Entry (iPhone-ready)

This is the **always-on** surface of the blog capture contract (Track D, Handoff §3.1).
Paste the block below into your Claude **personal preferences** (Settings → Profile →
"What personal preferences should Claude consider"). Preferences apply in **every**
chat on **every** platform — including the iPhone app — which is why this, not a Skill,
is what makes capture work from your phone.

It pairs with the deterministic trigger `/blog` and an ambient backstop (Claude offers
to package when it spots CPM blog intent). The exact same contract is also packaged by
the `cpm-package-blog` Skill in Cowork/Code — keep the two in sync; this doc and
`docs/skills/cpm-package-blog/SKILL.md` are the joint source of truth.

---

## PASTE THIS INTO YOUR CLAUDE PREFERENCES

For County Property Management blog work, keep two phases strictly separate:

CREATIVE PHASE (the default): When I raise a blog topic, or ask you to write, draft,
explore, or brainstorm a blog — even if I say "create a blog entry about X" — treat it
as a normal, open-ended conversation. Brainstorm angles, propose your own ideas, draft,
and revise with me in ordinary prose. Do NOT output the structured contract/frontmatter
format during this phase, and do not let any template constrain your thinking. At most,
once per conversation, you may add a brief one-line reminder that I can type `/blog` to
package it when we're happy — but never produce the contract block on your own. If we're
developing a multi-part series during the creative phase, keep track of the series name
and each part's order/number as they take shape, so packaging can number them correctly —
but still do NOT output the contract/frontmatter format until `/blog`.

PACKAGING PHASE (only on the exact command `/blog`): ONLY when I type `/blog` should you
convert what we've agreed on into the CPM blog contract. Output the contract as ONE single
fenced ```text code block and nothing else — so the app shows me a copy button and I can
paste it straight into an email. Everything must sit INSIDE that one ```text code block,
between the sentinel lines. Do NOT render the contract as ordinary prose/Markdown in the
message, and do NOT turn it into artifacts or separate documents — if it isn't inside the
```text code block, I can't capture it. If the conversation produced MORE THAN ONE distinct
post, stack each complete contract INSIDE that same single ```text code block — each between
its own `-----BEGIN CPM BLOG-----` / `-----END CPM BLOG-----` sentinel lines, one after
another, in the order we discussed. Each block must stand alone (full frontmatter + body, and
its own `---FAQ---` when faq_included is true). Never merge two posts into one block or split
one across two. The pipeline reads every block, so all of them ride in one email.

The contract block (PACKAGING PHASE only):

```text
-----BEGIN CPM BLOG-----
---
type: blog
campaign_id: null
series: <null, or the exact series name shared by every post in the series — e.g. "Next Level Real Estate Investing">
seriesPart: <null, or this post's 1-indexed position in the series — 1, 2, 3, …>
slug: null
title: "<headline>"
subtitle: "<one-sentence deck/subtitle>"
byline: "By Richard J. Miller · Founder, County Property Management · California Broker since 1995"
decision_intent: [<one or more of: selling, renting, holding, still-deciding>]
tags: [<zero or more of: blog_lead, lead_magnet, contact_form, strategy_session, owner_lead>]
publish_date: null
status: ready
source_chat_context: "<1-2 sentences: where this came from; may note private context — this is NEVER published, it stays in a private archive>"
gemini_prompt: "<a vivid image-generation prompt for the hero image>"
faq_included: <true or false>
---

<the full article body in Markdown — clear H2/H3 headings, lead each section with the point>

---FAQ---

Q: <question>
A: <direct answer first sentence, then expand>

Q: <question>
A: <answer>
-----END CPM BLOG-----
```

Rules:
- Keep `type`, `campaign_id`, `slug`, `publish_date`, `status` EXACTLY as shown
  (the PC stage fills slug/date and classifies). `status: ready` is required.
- `decision_intent` and `tags` use ONLY the values listed — invent none.
- `series` and `seriesPart` are PUBLIC-SAFE and are now rendered by the site: the
  blog index shows a "Part N of M" badge, and each post page shows a part label plus
  prev/next links to its neighbors. For a STANDALONE post, leave both `null`. For a
  post that belongs to a multi-part series, set `series` to the human-readable series
  name and `seriesPart` to its 1-indexed position.
- `series` must be the IDENTICAL string on every post in the same series (the site
  groups and counts by exact match). `seriesPart` must be a positive integer.
- `seriesTotal` ("of 6") is COMPUTED by the site from how many posts share the
  `series` name — never write a total into the contract.
- When `/blog` fans out several posts of the same series in one email, give every
  block the same `series` string and number `seriesPart` 1, 2, 3, … in the order we
  discussed.
- The series name is shown publicly — keep it clean and put nothing private in it
  (private/deal context still goes ONLY in `source_chat_context`).
- Only set `series`/`seriesPart` when the posts genuinely form a series we discussed
  as one. Never invent a series or a part number.
- YAML-safe values: `title`, `subtitle`, `byline`, `source_chat_context`,
  `gemini_prompt`, and `series` (when non-null) are double-quoted YAML. Escape any straight double quote inside the
  text as `\"` — e.g. `title: "Why \"No Pets\" Isn't Really About Pets"`. A bare `"`
  inside a `"..."` value is invalid YAML (the PC stage now auto-repairs it, but emit it
  right). A colon is safe as long as the value stays wrapped in quotes.
- Include the `---FAQ---` block only when `faq_included: true`; 3–6 strong Q&As,
  each answer leading with the direct answer.
- Put any private/client/deal specifics in `source_chat_context` only — never in the
  body or title. It is stored privately and never reaches the public site.
- Output the contract and nothing else, so I can copy it straight into an email.

---

## HOW TO SEND IT (iPhone)

The Claude iOS app outputs the contract as TEXT in a code block — it can't attach a file
or send mail itself. So the handoff is copy → email. The block is wrapped in
`-----BEGIN CPM BLOG-----` / `-----END CPM BLOG-----`, so pasting it into an email BODY is
all the harvester needs (no attachment required).

**Multiple posts in one email:** if `/blog` produced several stacked blocks (the fan-out),
copy the whole reply and paste it into one email — the harvester splits every sentinel pair
and creates one post per block. No need to send a separate email per post.

Manual path (works anywhere):
1. After `/blog`, tap the copy icon on the code block.
2. Open Mail → new message → paste into the body → send to **cpmblog93012@gmail.com**.
   Send from an allowlisted address (see `CPM_ALLOWED_SENDERS` in `.env.blog-inbox`).
3. The PC runner harvests it within ~15 min, converts, and auto-publishes it to the live site (the scheduled task runs with `-Publish`; the sender allowlist is the gate).

Near-one-tap path (recommended) — a one-time iOS Shortcut:
- Shortcuts app → New Shortcut → add action **Get Clipboard** → add action **Send Email**.
- In Send Email: set **To** = cpmblog93012@gmail.com, **Subject** = "CPM blog",
  **Body** = the Clipboard variable, and turn **Show Compose Sheet ON** (so you tap Send).
- Name it "Send CPM Blog" and pin it to the Home Screen / Share Sheet.
- Then the flow is: `/blog` → copy the block → run "Send CPM Blog" → tap Send.
