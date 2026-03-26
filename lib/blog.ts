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
    slug: 'cash-for-keys-case-study',
    title: 'Case Study: Cash for Keys Strategy',
    excerpt:
      'A practical example of how a structured tenant transition strategy can protect timelines and reduce conflict.',
    publishedAt: '2026-03-13',
    author: 'Richard Miller',
    category: 'Property Management',
    content: [
      'In certain situations, removing a tenant through traditional legal processes can create delays, uncertainty, and additional costs. One alternative approach is a structured “cash for keys” agreement.',
      'In this case, the objective was to regain possession of the property efficiently while minimizing disruption. Instead of extending a prolonged eviction process, a negotiated agreement created a faster resolution.',
      'This approach allowed the owner to regain control of the property on a defined timeline, reduce legal exposure, and prepare the property for its next phase—whether that meant leasing again or preparing for sale.',
      'Every situation is different, but strategies like this highlight the importance of approaching property decisions with flexibility and a clear understanding of available options.',
    ],
  },
  {
    slug: 'expert-witness-property-management',
    title: 'Expert Witness Services in Property Management',
    excerpt:
      'How property management experience can support legal cases and dispute resolution.',
    publishedAt: '2026-02-20',
    author: 'Richard Miller',
    category: 'Legal Updates',
    content: [
      'In certain real estate and property-related disputes, an experienced property manager can serve as an expert witness to provide clarity and context.',
      'These situations may involve lease interpretation, maintenance responsibilities, property standards, or management practices. Having an experienced professional explain industry norms can help support case evaluation.',
      'With decades of experience in Ventura County property management, expert-level insight can help attorneys, owners, and stakeholders better understand how properties are typically managed and where deviations may have occurred.',
      'This type of advisory role reinforces the broader positioning of property management as not just operational—but also strategic and consultative.',
    ],
  },
  {
    slug: 'rescue-your-rental-strategy',
    title: 'Rescue Your Rental: When a Property Needs a Reset',
    excerpt:
      'What to do when a rental property is underperforming or creating ongoing challenges.',
    publishedAt: '2026-02-03',
    author: 'Richard Miller',
    category: 'Owner Strategy',
    content: [
      'Some rental properties reach a point where performance declines due to tenant issues, deferred maintenance, or management gaps.',
      'In these situations, a reset strategy may be necessary. This can include repositioning the property, updating systems, addressing tenant concerns, or re-evaluating whether the property should remain a rental at all.',
      'The key is to step back and evaluate whether the property should continue as-is, be improved, or transition into a different strategy such as selling or holding for a different purpose.',
      'This is where a structured rent, sell, or hold evaluation becomes critical, allowing owners to move forward with clarity rather than reacting to ongoing problems.',
    ],
  },
  {
    slug: 'best-property-management-company-camarillo',
    title: 'County Property Management Named Best Property Management Company in Camarillo',
    excerpt:
      'Recognition reflects long-term commitment to service, communication, and property performance.',
    publishedAt: '2026-01-10',
    author: 'County Property Management',
    category: 'Company Updates',
    content: [
      'County Property Management was recently recognized as a leading property management company in Camarillo, reflecting a continued focus on service quality and operational consistency.',
      'This recognition is not based on a single transaction, but on long-term client relationships, responsiveness, and the ability to manage properties effectively across changing market conditions.',
      'For owners, this type of consistency is critical. Property management is not just about handling tasks—it is about protecting the performance of a real estate asset over time.',
      'As the company continues to evolve, the focus remains on combining operational execution with strategic advisory support for property owners.',
    ],
  },
  {
    slug: 'california-security-deposit-law-2024',
    title: 'California Security Deposit Law Change (July 1, 2024): What You Need to Know',
    excerpt:
      'Key updates to California security deposit regulations and what they mean for property owners.',
    publishedAt: '2024-07-01',
    author: 'Richard Miller',
    category: 'Legal Updates',
    content: [
      'Recent updates to California law have changed how security deposits are handled, impacting both property owners and tenants.',
      'These changes may affect deposit limits, documentation requirements, and expectations around property condition and return of funds.',
      'For property owners, staying compliant is critical. Missteps in handling deposits can lead to disputes or legal exposure.',
      'Working with a professional property management structure can help ensure that processes align with current regulations while maintaining consistency across properties.',
      'As regulations evolve, owners benefit from staying informed and treating compliance as part of a broader property strategy rather than a one-time task.',
    ],
  },
]

export function getAllPosts() {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}