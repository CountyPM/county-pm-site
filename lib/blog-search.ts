// lib/blog-search.ts
//
// Dependency-free weighted search over the build-time index
// (public/search-index.json, emitted by scripts/build-search-index.mjs).
//
// Why not Fuse.js: at ~110 records a hand-rolled scorer needs no new
// dependency, shares types with the rest of the site, and gives us exact
// control over synonym expansion and highlighting. Field weights follow the
// findability spec: title .40, subtitle .25, excerpt .15, headings .12,
// category .08 — plus (full-body upgrade) the complete stripped body at .10
// with a term-frequency bonus, and an exact-phrase boost for multi-word
// queries. Matching is substring-based with whole-word > prefix > substring
// quality tiers, and a coverage factor so records matching more of the query
// rank first.
//
// The SEMANTIC layer (embeddings) lives in lib/blog-search-client.ts — this
// module stays pure/synchronous so it can run anywhere (tests, node, client).

export type SearchRecord = {
  slug: string
  title: string
  subtitle: string
  category: string
  intent: string[]
  series: string | null
  seriesPart: number | null
  seriesTotal: number | null
  date: string
  headings: string[]
  excerpt: string
  /** Full markdown-stripped body (capped) for deep keyword/phrase matching. */
  body: string
  /** Frontmatter excerpt verbatim — for rendering result cards. */
  excerptDisplay: string
  heroImage: string | null
  heroImageAlt: string | null
}

export type SearchResult = {
  record: SearchRecord
  score: number
  /** Query tokens (originals + expansions) that matched anywhere — used for highlighting. */
  matchedTokens: string[]
  /** Set by the semantic layer when a result was surfaced/boosted by embeddings. */
  semantic?: boolean
}

const FIELD_WEIGHTS: Array<[keyof SearchRecord, number]> = [
  ['title', 0.4],
  ['subtitle', 0.25],
  ['excerpt', 0.15],
  ['headings', 0.12],
  ['category', 0.08],
  ['body', 0.1],
]

// Body matches get a term-frequency bonus: a post that says "deposit" eight
// times should outrank one that mentions it once in passing.
const TF_FIELD = 'body'
const TF_MAX = 5
const TF_STEP = 0.15

// A multi-word query found verbatim (as a phrase) in a field is a much
// stronger signal than its words scattered around — boost proportional to the
// best field it appears in.
const PHRASE_BOOST = 0.6

// Visitors don't use statute language (spec §"Synonym handling").
// Applied as QUERY EXPANSION — aliases are appended at half weight, the
// user's original words always still match on their own.
const SYNONYMS: Array<[RegExp, string[]]> = [
  [/\bsecurity deposit\b|\bdeposit\b/, ['1950.5', 'move-out', 'damage', 'deduction']],
  [/\beviction\b|\bevict\b/, ['cash for keys', 'non-payment', 'unlawful detainer']],
  [/\btax\b|\btaxes\b/, ['1031', 'depreciation', 'step-up', '469', 'capital gains']],
  [/\bpets?\b/, ['ESA', 'emotional support animal', 'service animal']],
  [/\besa\b/, ['emotional support animal', 'pet']],
  [/\bfire\b|\bwildfire\b/, ['SB 610', 'disaster', 'evacuation', 'habitability']],
  [/\bsell\b|\bselling\b/, ['1031', 'exit', 'listing', 'capital gains']],
  [/\b1031\b/, ['exchange', 'capital gains']],
  [/\binsurance\b/, ['premium', 'coverage']],
  [/\binherit\w*\b/, ['step-up', 'probate', 'estate']],
  [/\bvacancy\b|\bvacant\b/, ['turnover', 'days on market']],
  [/\bscreening\b|\bapplicant\b/, ['tenant screening', 'background', 'credit']],
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9.§]+/)
    .filter((t) => t.length >= 2)
}

/** Expand a raw query into weighted tokens: originals at 1.0, synonyms at 0.5. */
export function expandQuery(query: string): Array<{ token: string; weight: number }> {
  const q = query.toLowerCase().trim()
  const original = tokenize(q)
  const out = original.map((token) => ({ token, weight: 1 }))
  const seen = new Set(original)

  for (const [pattern, aliases] of SYNONYMS) {
    if (!pattern.test(q)) continue
    for (const alias of aliases) {
      for (const token of tokenize(alias)) {
        if (seen.has(token)) continue
        seen.add(token)
        out.push({ token, weight: 0.5 })
      }
    }
  }
  return out
}

/** Match quality of one token against one text: word 1.0, prefix 0.85, substring 0.6, none 0. */
function quality(token: string, text: string): number {
  const idx = text.indexOf(token)
  if (idx === -1) return 0
  const before = idx === 0 || !/[a-z0-9]/.test(text[idx - 1])
  const afterIdx = idx + token.length
  const after = afterIdx >= text.length || !/[a-z0-9]/.test(text[afterIdx])
  if (before && after) return 1
  if (before) return 0.85
  return 0.6
}

/** Count non-overlapping occurrences of `token` in `text`, capped. */
function countOccurrences(token: string, text: string, cap: number): number {
  let n = 0
  let from = 0
  while (n < cap) {
    const idx = text.indexOf(token, from)
    if (idx === -1) break
    n++
    from = idx + token.length
  }
  return n
}

export function searchPosts(
  records: SearchRecord[],
  query: string,
  limit = 50
): SearchResult[] {
  const tokens = expandQuery(query)
  if (tokens.length === 0) return []
  const originals = tokens.filter((t) => t.weight === 1)

  // Normalized phrase for exact-phrase detection ("21 day clock" should hit
  // "21-day clock" too, so compare on token-joined text).
  const phrase = originals.map((t) => t.token).join(' ')
  const usePhrase = originals.length >= 2

  // PASS 1 — per-record, per-token raw scores. Kept so pass 2 can apply IDF:
  // rare terms ("inherited", "1950.5") must outweigh corpus-common ones
  // ("house", "rent"), or common words drown the term the user actually
  // cares about.
  type Partial = {
    record: SearchRecord
    fields: Array<[keyof SearchRecord, string, number]>
    tokenScores: number[] // parallel to `tokens`
  }
  const partials: Partial[] = []
  const docFreq = new Array(tokens.length).fill(0)

  for (const record of records) {
    const fields: Array<[keyof SearchRecord, string, number]> = FIELD_WEIGHTS.map(
      ([key, w]) => {
        const v = record[key]
        const text = Array.isArray(v) ? v.join(' | ') : String(v ?? '')
        return [key, text.toLowerCase(), w]
      }
    )

    const tokenScores = new Array(tokens.length).fill(0)
    let any = false
    for (let t = 0; t < tokens.length; t++) {
      const { token } = tokens[t]
      let tokenScore = 0
      for (const [key, text, fieldWeight] of fields) {
        const q = quality(token, text)
        if (q === 0) continue
        let fieldScore = fieldWeight * q
        if (key === TF_FIELD) {
          const count = countOccurrences(token, text, TF_MAX)
          fieldScore *= 1 + TF_STEP * (count - 1)
        }
        tokenScore += fieldScore
      }
      if (tokenScore > 0) {
        tokenScores[t] = tokenScore
        docFreq[t]++
        any = true
      }
    }
    if (any) partials.push({ record, fields, tokenScores })
  }

  // IDF per token, normalized to (0, 1]: df=1 → 1.0, df=N → small.
  const N = records.length || 1
  const idfMax = Math.log(1 + N)
  const idf = docFreq.map((df) =>
    df > 0 ? Math.log(1 + N / df) / idfMax : 0
  )

  // PASS 2 — aggregate with IDF, phrase boost, coverage.
  const results: SearchResult[] = []
  for (const { record, fields, tokenScores } of partials) {
    let score = 0
    let originalHits = 0
    let originalWeightSum = 0
    let originalHitWeightSum = 0
    const matchedTokens: string[] = []

    for (let t = 0; t < tokens.length; t++) {
      const { token, weight } = tokens[t]
      if (weight === 1) originalWeightSum += idf[t]
      if (tokenScores[t] <= 0) continue
      matchedTokens.push(token)
      score += tokenScores[t] * weight * idf[t]
      if (weight === 1) {
        originalHits++
        originalHitWeightSum += idf[t]
      }
    }

    // Exact-phrase boost: the user's words, adjacent and in order, in one field.
    if (usePhrase && score > 0) {
      let best = 0
      for (const [, text, fieldWeight] of fields) {
        // Compare token-normalized: strip punctuation the same way tokenize does.
        const norm = text.split(/[^a-z0-9.§]+/).filter(Boolean).join(' ')
        if (norm.includes(phrase)) best = Math.max(best, fieldWeight)
      }
      if (best > 0) score += PHRASE_BOOST * (best / 0.4) // scale: title hit = full boost
    }

    if (score <= 0) continue
    // Coverage: matching all the user's actual words beats matching one of
    // them plus synonyms — IDF-weighted, so missing a rare word costs more
    // than missing a filler word. (No originals matched at all -> synonym-only
    // hit, keep it but at a discount.)
    const coverage =
      originalWeightSum > 0
        ? 0.4 + 0.6 * (originalHitWeightSum / originalWeightSum)
        : originals.length > 0 && originalHits === 0
          ? 0.4
          : 1
    results.push({ record, score: score * coverage, matchedTokens })
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      new Date(b.record.date).getTime() - new Date(a.record.date).getTime()
  )
  return results.slice(0, limit)
}

/**
 * Split `text` into plain/highlighted segments for the matched tokens.
 * Only meant for title/subtitle (spec: don't highlight inside excerpts).
 */
export function highlight(
  text: string,
  matchedTokens: string[]
): Array<{ text: string; hit: boolean }> {
  if (!text || matchedTokens.length === 0) return [{ text, hit: false }]
  const lower = text.toLowerCase()
  const marks = new Array<boolean>(text.length).fill(false)

  for (const token of matchedTokens) {
    let from = 0
    while (from <= lower.length - token.length) {
      const idx = lower.indexOf(token, from)
      if (idx === -1) break
      for (let i = idx; i < idx + token.length; i++) marks[i] = true
      from = idx + token.length
    }
  }

  const segments: Array<{ text: string; hit: boolean }> = []
  let start = 0
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marks[i] !== marks[start]) {
      segments.push({ text: text.slice(start, i), hit: marks[start] })
      start = i
    }
  }
  return segments
}
