// lib/faq.ts
//
// Read/render side of the CPM FAQ hub. Mirrors lib/blog.ts.
//
// Storage model (decided 2026-06-25): one Markdown file per entry in
// content/faq/<slug>.md. Frontmatter carries the question, its topic cluster,
// provenance (derivedFrom + created), optional third-party sources, and an
// append-only annotations log (the "living FAQ"). The body is the master
// answer. Topic metadata is data-driven: it lives on the entries themselves and
// is deduped here, so adding a new topic never requires a code change.
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const FAQ_DIR = path.join(process.cwd(), 'content/faq')

export type FaqSource = {
  label: string
  url: string
}

// Annotations are append-only. type escalates: additive -> soft-revision ->
// strong-revision/contradiction. The reconciliation engine that WRITES these is
// deferred; this is the render contract only.
export type FaqAnnotation = {
  date: string
  type: 'additive' | 'soft-revision' | 'strong-revision' | 'contradiction'
  note: string
  post?: string // triggering blog slug
  postUrl?: string // explicit link override
}

export type FaqEntryMeta = {
  slug: string
  question: string
  topic: string // topic-cluster slug; groups entries onto one /faq/<topic> page
  topicTitle: string
  topicDescription?: string
  type: 'objective' | 'subjective'
  derivedFrom: string[] // blog slugs this answer was derived from
  created: string
  sources: FaqSource[]
  annotations: FaqAnnotation[]
  // Slug(s) of sibling FAQ entries this one relates to (the cross-link graph,
  // track A slice 3). Reciprocal by construction: if A lists B, B lists A. Written
  // by scripts/crosslink-faq.mjs --apply after review; rendered as "Related
  // questions". Mirrors the blog `faq:` spoke.
  related: string[]
  order: number // ordering within the topic page
}

export type FaqEntry = FaqEntryMeta & {
  answer: string // master answer (Markdown body)
}

export type FaqTopic = {
  slug: string
  title: string
  description?: string
  entries: FaqEntry[]
}

function normalizeSources(raw: unknown): FaqSource[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({
      label: String((s as FaqSource).label || ''),
      url: String((s as FaqSource).url || ''),
    }))
    .filter((s) => s.label && s.url)
}

function normalizeAnnotations(raw: unknown): FaqAnnotation[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a) => a && typeof a === 'object')
    .map((a) => {
      const ann = a as FaqAnnotation
      return {
        date: String(ann.date || ''),
        type: (ann.type || 'additive') as FaqAnnotation['type'],
        note: String(ann.note || ''),
        post: ann.post ? String(ann.post) : undefined,
        postUrl: ann.postUrl ? String(ann.postUrl) : undefined,
      }
    })
    .filter((a) => a.note)
    // append-only: render oldest-first so the update history reads as a timeline
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function parseEntry(slug: string, raw: string): FaqEntry {
  const { data, content } = matter(raw)
  return {
    slug,
    question: String(data.question || ''),
    topic: String(data.topic || 'general'),
    topicTitle: String(data.topicTitle || data.topic || 'General'),
    topicDescription: data.topicDescription
      ? String(data.topicDescription)
      : undefined,
    type: data.type === 'objective' ? 'objective' : 'subjective',
    derivedFrom: Array.isArray(data.derivedFrom)
      ? data.derivedFrom.map(String)
      : [],
    created: String(data.created || ''),
    sources: normalizeSources(data.sources),
    annotations: normalizeAnnotations(data.annotations),
    related: Array.isArray(data.related)
      ? Array.from(new Set(data.related.map(String).filter(Boolean)))
      : [],
    order: typeof data.order === 'number' ? data.order : 999,
    answer: content.trim(),
  }
}

export function getAllFaqEntries(): FaqEntry[] {
  if (!fs.existsSync(FAQ_DIR)) return []

  return fs
    .readdirSync(FAQ_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(FAQ_DIR, file), 'utf8')
      return parseEntry(slug, raw)
    })
    .sort((a, b) => a.order - b.order)
}

export function getFaqEntry(slug: string): FaqEntry | null {
  const filePath = path.join(FAQ_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  return parseEntry(slug, fs.readFileSync(filePath, 'utf8'))
}

// Group entries into their topic clusters. Topic title/description are taken
// from the first entry in the topic that supplies them (data-driven topics).
export function getFaqTopics(): FaqTopic[] {
  const entries = getAllFaqEntries()
  const bySlug = new Map<string, FaqTopic>()

  for (const entry of entries) {
    let topic = bySlug.get(entry.topic)
    if (!topic) {
      topic = {
        slug: entry.topic,
        title: entry.topicTitle,
        description: entry.topicDescription,
        entries: [],
      }
      bySlug.set(entry.topic, topic)
    }
    if (!topic.description && entry.topicDescription) {
      topic.description = entry.topicDescription
    }
    topic.entries.push(entry)
  }

  return Array.from(bySlug.values()).map((topic) => ({
    ...topic,
    entries: topic.entries.sort((a, b) => a.order - b.order),
  }))
}

export function getFaqTopic(slug: string): FaqTopic | null {
  return getFaqTopics().find((t) => t.slug === slug) || null
}

// Canonical URL for an entry's passage on its topic-cluster page. Spokes and the
// index both link here so every reference points at the single source of truth.
export function faqEntryUrl(entry: Pick<FaqEntry, 'topic' | 'slug'>): string {
  return `/faq/${entry.topic}#${entry.slug}`
}

// Resolve an entry's `related` slugs to the sibling entries, in declared order.
// Unresolvable slugs (a related entry that no longer exists) are dropped so the
// render and JSON-LD never point at a 404 — validate-faq.mjs is the gate that
// flags them at publish time, but the reader stays defensive regardless.
export function getRelatedEntries(
  entry: Pick<FaqEntry, 'slug' | 'related'>
): FaqEntryMeta[] {
  if (!entry.related.length) return []
  const all = getAllFaqEntries()
  const bySlug = new Map(all.map((e) => [e.slug, e]))
  const out: FaqEntryMeta[] = []
  for (const slug of entry.related) {
    if (slug === entry.slug) continue // never self-link
    const target = bySlug.get(slug)
    if (target) out.push(target)
  }
  return out
}

// Flatten a Markdown answer to plain prose for the FAQPage JSON-LD acceptedAnswer
// text. Schema.org wants the answer as text, not markup. Includes the dated
// annotations so the structured-data answer stays in sync with what's rendered.
export function faqAnswerPlainText(entry: FaqEntry): string {
  const base = entry.answer
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code spans
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[*_#>]/g, '') // emphasis/heading/quote markers
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const updates = entry.annotations
    .map((a) => `Update (${a.date}): ${a.note}`)
    .join(' ')

  return updates ? `${base} ${updates}` : base
}

