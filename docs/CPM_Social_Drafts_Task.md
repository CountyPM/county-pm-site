# CPM Social Drafts — Scheduled Task

**Purpose:** Document the social-distribution arm of the CPM content system. This was added **after** the original GEO roadmap (Tracks A–E) and is not covered by any other doc.

---

## What it is

A scheduled Cowork agent task that assembles **CPM LinkedIn + Google Business Profile post drafts** on a recurring basis, for **manual approval**. Unlike the FAQ pipeline and the blog capture runner (both now auto-publish), this task is **review-first by design**: it produces drafts only and posts nothing automatically.

| Field | Value |
|---|---|
| Task ID | `cpm-social-drafts` |
| Description | Twice-weekly: assemble CPM LinkedIn + Google Business Profile post drafts for manual approval |
| Schedule | Tuesdays & Fridays, ~08:10 AM (cron `0 8 * * 2,5`) |
| Output | Draft social posts for LinkedIn + Google Business Profile |
| Publish model | **Manual approval** — drafts only, nothing is posted automatically |
| Prompt / logic | `C:\Users\cpm\Claude\Scheduled\cpm-social-drafts\SKILL.md` (source of truth for the exact instructions) |

## Where it fits

The GEO initiative makes the site **findable and citable** (FAQ hub, structured data, indexing). This task is the **outbound distribution** counterpart: it repurposes CPM content into social drafts to drive reach and referrals. It draws on the same body of blog/FAQ content but publishes to owned social surfaces rather than the site.

## Relationship to the other scheduled tasks

Three other tasks run alongside it (all on Windows/Cowork schedules):

- `faq-write-publish-pipeline` — weekly (Mon), authors + reconciles FAQ entries (auto-publish).
- `faq-source-link-check` — weekly (Mon), Track B source-link rot check.
- `publish-faq.ps1` (Windows Task Scheduler) — daily, commits/pushes finished FAQ entries.

`cpm-social-drafts` is independent of the publish pipeline — it neither reads from nor writes to `content/`; it only produces drafts for a person to approve and post.

## Maintenance notes

- The exact prompt, tone, and any account/handle references live in the task's `SKILL.md` (path above), not here — edit there to change behavior.
- Because it is review-first, a failed or empty run is low-risk (no bad content ships), but a **silently non-running** task means no drafts appear — worth a periodic glance at `lastRunAt` in the scheduled-task list.

---

*Added 2026-07-03 to close a documentation gap: the task was live with no doc coverage.*
