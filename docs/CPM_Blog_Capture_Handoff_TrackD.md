# CPM Blog Capture / Handoff — Track D (the FRONT of the blog pipeline)

Track D is the capture layer that feeds the already-built PC stage (`scripts/post-blog.mjs`).
It closes the loop: **a bloggable chat on your iPhone → an email → a live post on c-p-m.com/blog.**

## The loop

1. **Capture (iPhone or Cowork/Code).** You type `/blog` in any Claude chat. Claude packages
   the conversation into a contract (`cpm-blog_<slug>.md`, format per
   `CPM_Blog_FieldMapping_Spec.md`). The trigger and format live in two synced surfaces:
   - `docs/CPM_Blog_Capture_Preferences.md` — paste into Claude preferences; works on iPhone.
   - `docs/skills/cpm-package-blog/SKILL.md` — the Cowork/Code Skill that executes it.
2. **Bridge (email).** You copy the block and email it to **cpmblog93012@gmail.com**.
3. **Harvest (PC).** `scripts/harvest-blog-inbox.mjs` logs into that mailbox over IMAP, pulls
   unseen mail **from allowlisted senders only**, extracts the contract, and writes it to
   `./incoming/`. No desktop mail client needed.
4. **Convert + publish (PC).** `scripts/post-blog-inbox.ps1` runs each contract through
   `post-blog.mjs` (→ public-safe `content/blog/<slug>.mdx` + private sidecar + git commit),
   then moves it to `./.blog-processed/`. **Review-first by default** (commits, no push);
   `-Publish` pushes to `main` → Vercel deploys.

## Decisions locked (2026-06-29)

- **Bridge = email** (dedicated Gmail `cpmblog93012@gmail.com`, harvested over IMAP).
- **Trigger = `/blog`** plus an ambient "offer to package" backstop.
- **Publish gate = review-first** for the first runs; flip to `-Publish` once proven.

## Security model

- **Sender allowlist (required).** The runner auto-commits, so `harvest-blog-inbox.mjs`
  refuses to process mail from anyone outside `CPM_ALLOWED_SENDERS`. This is the anti-injection
  guard — an attacker emailing the inbox cannot inject a post.
- **Secrets never committed.** The IMAP app password lives in `.env.blog-inbox` (gitignored).
  Inbox/archive folders (`/incoming/`, `/.blog-processed/`) hold raw contracts with private
  fields (`source_chat_context`, `gemini_prompt`) and are gitignored. `post-blog.mjs`'s privacy
  guard hard-fails if those fields ever reach published frontmatter.
- **Human gate.** Going live stays behind `--publish` / `-Publish`.

## One-time PC setup

1. **Credentials.** `.env.blog-inbox` is already created with the Gmail host/user and the
   "CPM blog runner" app password. **Edit `CPM_ALLOWED_SENDERS`** to the address your iPhone
   Mail actually sends from before testing.
2. **Install deps** (needs network; the runner also self-installs on first run):
   ```
   cd C:\Users\cpm\county-pm-site
   npm install
   ```
3. **Smoke-test the harvest** (reports only, writes nothing):
   ```
   node scripts/harvest-blog-inbox.mjs --dry-run
   ```
4. **Register the scheduled task** (runs every 15 min, review-first):
   ```
   scripts\setup-blog-task.bat
   ```
5. **Install the capture surfaces:** paste `CPM_Blog_Capture_Preferences.md` into your Claude
   preferences; add `cpm-package-blog` as a Skill via Settings → Capabilities (Cowork/Code).

## First test loop (review-first)

1. iPhone: in a Claude chat, type `/blog` on a throwaway topic, copy the block, email it to
   `cpmblog93012@gmail.com` from an allowlisted address.
2. PC: run `powershell -ExecutionPolicy Bypass -File scripts\post-blog-inbox.ps1`
   (or wait for the scheduled task). Check `blog-publish.log`.
3. Confirm `content/blog/<slug>.mdx` was created and committed locally, and the contract moved
   to `.blog-processed/`. Eyeball the post.
4. When satisfied, publish: `git push origin HEAD:main`, or re-run with `-Publish`, or add
   `-Publish` to the scheduled task to go fully automatic.

## Files

| File | Role |
|---|---|
| `docs/CPM_Blog_Capture_Preferences.md` | iPhone/preferences capture surface (`/blog`) |
| `docs/skills/cpm-package-blog/SKILL.md` | Cowork/Code capture Skill (same contract) |
| `scripts/harvest-blog-inbox.mjs` | IMAP harvester: mailbox → `./incoming/` |
| `scripts/post-blog-inbox.ps1` | Runner: harvest → convert → commit → archive |
| `scripts/setup-blog-task.bat` | Registers the "CPM Blog Capture" scheduled task |
| `.env.blog-inbox.sample` | Config template (committed) |
| `.env.blog-inbox` | Real IMAP creds (gitignored, on the PC only) |
| `scripts/post-blog.mjs` | (existing) contract → MDX + sidecar + commit/push |

Related: `CPM_Blog_Pipeline_Handoff.md` (architecture), `CPM_Blog_FieldMapping_Spec.md` (format authority).
