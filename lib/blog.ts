export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  author: string
  category: string
  content: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'ventura-county-rent-vs-sell-guide',
    title: 'Rent vs Sell in Ventura County: How to Think Through the Decision',
    excerpt:
      'A practical framework for owners deciding whether a property should be rented, sold, or held.',
    publishedAt: '2026-03-26',
    author: 'County Property Management',
    category: 'Owner Strategy',
    content: [
      'Many property owners feel pressure to decide quickly whether to sell or rent. In reality, the right answer depends on your timing, equity, goals, and flexibility.',
      'For some owners, renting creates income and preserves optionality. For others, selling may unlock capital and simplify the next chapter. The key is evaluating the decision strategically rather than emotionally.',
      'County Property Management is building its advisory approach around helping owners explore rent, sell, and hold scenarios before committing to one path.',
    ],
  },
  {
    slug: 'what-property-owners-should-know-before-hiring-a-manager',
    title: 'What Property Owners Should Know Before Hiring a Property Manager',
    excerpt:
      'A high-level overview of what to look for when evaluating property management support.',
    publishedAt: '2026-03-26',
    author: 'County Property Management',
    category: 'Property Management',
    content: [
      'Hiring a property manager is not only an operational decision. It is also a strategic decision about how you want your property and your time managed.',
      'Owners should understand communication expectations, maintenance coordination, reporting visibility, leasing support, and how the manager fits into long-term ownership planning.',
      'A strong property management relationship should support not just the property, but the owner’s broader goals.',
    ],
  },
  {
    slug: 'why-agents-need-a-property-management-referral-partner',
    title: 'Why Agents Need a Trusted Property Management Referral Partner',
    excerpt:
      'How agents can better serve owners who are not ready to sell immediately.',
    publishedAt: '2026-03-26',
    author: 'County Property Management',
    category: 'Agent Relationships',
    content: [
      'Not every owner is ready to sell right now. Some need flexibility, income, or time before making a final decision.',
      'When agents have a trusted property management referral partner, they can serve those clients better without forcing the relationship into a premature sale conversation.',
      'That creates better owner outcomes and often stronger long-term referral relationships.',
    ],
  },
]

export function getAllPosts() {
  return [...blogPosts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}