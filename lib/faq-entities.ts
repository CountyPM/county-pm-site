// lib/faq-entities.ts
//
// The "subsidiary registry" read side (GEO track A slice 3). Authoritative orgs
// and statutes a FAQ answer is *about* live in scripts/faq-source-registry.json
// as `entities[]` — schema.org-typed nodes (Legislation / GovernmentOrganization)
// with canonical `sameAs` URLs. This module loads them, resolves shared-entity
// references, and matches an FAQ entry to the entities its topic invokes (same
// keyword `match[]` mechanism the write pipeline uses to attach sources).
//
// structured-data.ts turns these into JSON-LD `about` nodes so an answer engine
// can resolve a passage to the governing law/agency — the cross-link layer's
// external half. Pure read; no network; safe in SSG.
import fs from 'fs'
import path from 'path'

const REGISTRY_PATH = path.join(process.cwd(), 'scripts/faq-source-registry.json')

export type FaqEntity = {
  name: string
  type: string // schema.org type, e.g. 'Legislation' | 'GovernmentOrganization'
  sameAs: string[]
}

type RawEntity = { name?: string; type?: string; sameAs?: string[]; entityRef?: string }
type RawEntry = { id: string; match?: string[]; entities?: RawEntity[] }
type RawRegistry = { entities?: RawEntity[]; entries?: RawEntry[] }

let cache: { entries: { match: string[]; entities: FaqEntity[] }[] } | null = null

function loadRegistry(): { entries: { match: string[]; entities: FaqEntity[] }[] } {
  if (cache) return cache
  if (!fs.existsSync(REGISTRY_PATH)) {
    cache = { entries: [] }
    return cache
  }
  let raw: RawRegistry
  try {
    raw = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
  } catch {
    cache = { entries: [] }
    return cache
  }

  // Shared entities (orgs reused across topics) are declared once at the top and
  // referenced by id via { entityRef }.
  const shared = new Map<string, FaqEntity>()
  for (const e of raw.entities || []) {
    if (e && e.name && e.type && Array.isArray(e.sameAs)) {
      const id = (e as RawEntity & { id?: string }).id
      if (id) shared.set(id, { name: e.name, type: e.type, sameAs: e.sameAs })
    }
  }

  const resolve = (list: RawEntity[] | undefined): FaqEntity[] => {
    const out: FaqEntity[] = []
    for (const e of list || []) {
      if (!e) continue
      if (e.entityRef) {
        const s = shared.get(e.entityRef)
        if (s) out.push(s)
        continue
      }
      if (e.name && e.type && Array.isArray(e.sameAs)) {
        out.push({ name: e.name, type: e.type, sameAs: e.sameAs })
      }
    }
    return out
  }

  cache = {
    entries: (raw.entries || []).map((entry) => ({
      match: (entry.match || []).map((m) => String(m).toLowerCase()),
      entities: resolve(entry.entities),
    })),
  }
  return cache
}

function dedupe(entities: FaqEntity[]): FaqEntity[] {
  const seen = new Set<string>()
  const out: FaqEntity[] = []
  for (const e of entities) {
    const key = (e.sameAs && e.sameAs[0]) || e.name
    if (seen.has(key)) continue
    seen.add(key)
    out.push(e)
  }
  return out
}

// Match an FAQ entry to the authoritative entities its topic invokes. `text`
// should be the entry's question + answer (lowercased internally). Returns the
// deduped union of entities from every registry topic whose keywords appear.
export function getEntitiesForText(text: string): FaqEntity[] {
  const hay = ` ${String(text).toLowerCase()} `
  const reg = loadRegistry()
  const matched: FaqEntity[] = []
  for (const entry of reg.entries) {
    if (entry.match.some((kw) => kw && hay.includes(kw))) {
      matched.push(...entry.entities)
    }
  }
  return dedupe(matched)
}
