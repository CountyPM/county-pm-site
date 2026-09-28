// components/quiz/landlord-compliance-questions.ts
//
// Question bank for the evergreen "Are You Legally Compliant as a California
// Landlord?" self-assessment at /resources/california-landlord-quiz.
// Permanent URL, never rotates. Kept separate from the component so the future
// rotating quiz can reuse <LandlordComplianceQuiz questions={...} />.
//
// Every question carries `post` + `href`: the CPM article that explains the
// rule. A null href renders as a plain reference line instead of a dead link.
//
// House convention: abbreviations spelled out on first use within each
// question (the results page can show any question on its own).

export type QuizPhase = 'before' | 'during' | 'after'

export type QuizQuestion = {
  phase: QuizPhase
  q: string
  options: string[]
  /** Index into `options` of the correct answer. */
  answer: number
  why: string
  cost: string
  post: string
  href: string | null
}

export const QUIZ_PHASES: { key: QuizPhase; label: string }[] = [
  { key: 'before', label: 'Before the tenant moves in' },
  { key: 'during', label: 'During the tenancy' },
  { key: 'after', label: 'When it ends' },
]

export const LANDLORD_COMPLIANCE_QUESTIONS: QuizQuestion[] = [
  // ---- Before the tenant moves in (7) ----
  {
    phase: 'before',
    q: 'Your listing says “No Section 8.” Under California law that phrase is:',
    options: [
      'Legal — you can set your own payment terms',
      'Legal if you own four units or fewer',
      'A fair housing violation on its face',
      'Legal spoken, but not in writing',
    ],
    answer: 2,
    why: 'Source of income — including a housing voucher — is a protected characteristic under the Fair Employment and Housing Act (FEHA, Government Code §12955), amended by Senate Bill 329 in 2019. The sentence is evidence of intent before anyone has applied.',
    cost: 'FEHA damages are not capped and the prevailing tenant recovers attorney fees. A screenshot of the ad is the entire case.',
    post: 'Your Rental Ad Is the First Legal Document of the Tenancy',
    href: '/blog/your-rental-ad-is-the-first-legal-document-of-the-tenancy',
  },
  {
    phase: 'before',
    q: 'You charge an application screening fee. What does the law require you to do with it?',
    options: [
      'Nothing — it is yours once the applicant pays',
      'Give an itemized receipt and refund the unused portion',
      'Hold it and credit it against the deposit',
      'Refund it only if you reject the applicant',
    ],
    answer: 1,
    why: 'Civil Code §1950.6 caps the fee at a Consumer Price Index–adjusted amount, requires an itemized receipt showing your actual out-of-pocket costs and time, and requires you to refund whatever you did not spend.',
    cost: 'The dollars are small. The exposure is that it is one violation per applicant, and the records prove the pattern.',
    post: 'Charge What It Costs You',
    href: '/blog/charge-what-it-costs-you',
  },
  {
    phase: 'before',
    q: 'An applicant pays the screening fee. You rent to someone else before ever running their credit. You must:',
    options: [
      'Keep it — you reviewed the application',
      'Refund the full fee',
      'Refund half',
      'Apply it to the next vacancy',
    ],
    answer: 1,
    why: 'Assembly Bill 2493 tightened Civil Code §1950.6: a fee you did not spend on screening is a fee you have to give back. Reviewing an application is not screening.',
    cost: 'Small per applicant, easy to plead as a pattern across a rental history.',
    post: 'Charge What It Costs You',
    href: '/blog/charge-what-it-costs-you',
  },
  {
    phase: 'before',
    q: 'Your rental was built in 1985. Which disclosure do you NOT owe the tenant?',
    options: [
      'Lead-based paint',
      "Megan's Law database notice",
      'Bed bug information',
      'Smoke and carbon monoxide compliance',
    ],
    answer: 0,
    why: 'The federal lead-based paint disclosure applies to housing built before 1978. The other three apply regardless of the year the house went up.',
    cost: 'Owners who assume lead paint is the disclosure requirement often miss the three that actually apply to their building.',
    post: 'The Sentence That Decides Whether You Have an Exemption',
    href: '/blog/the-sentence-that-decides-whether-you-have-an-exemption',
  },
  {
    phase: 'before',
    q: 'Your single-family rental qualifies for the Assembly Bill 1482 exemption. To actually claim it you must:',
    options: [
      'Do nothing — single-family homes are exempt automatically',
      'Record a notice with the county',
      'Give the tenant the statutory exemption language in writing',
      'File an exemption with the Department of Housing and Community Development',
    ],
    answer: 2,
    why: 'The exemption is conditional. It exists only if the required notice reaches the tenant. Without the notice, a qualifying property is covered by the rent cap and the just-cause rules anyway.',
    cost: 'An owner who skipped the notice and then served a no-cause termination has an invalid notice and a relocation-assistance obligation.',
    post: 'The Sentence That Decides Whether You Have an Exemption',
    href: '/blog/the-sentence-that-decides-whether-you-have-an-exemption',
  },
  {
    phase: 'before',
    q: 'Since July 1, 2024, the maximum security deposit on an unfurnished rental is:',
    options: [
      "Two months' rent",
      'Two months unfurnished, three months furnished',
      "One month's rent, with a narrow exception for some small owners",
      'Whatever the lease provides',
    ],
    answer: 2,
    why: 'Assembly Bill 12 set one month regardless of furnishing. A natural person owning no more than two residential properties totaling no more than four units may take two months — but not from a service member.',
    cost: 'The overcharge comes back, and it hands the tenant a good-faith argument against every other line on your itemization.',
    post: "You Can Probably Charge Two Months. Here's Why I Wouldn't.",
    href: '/blog/you-can-probably-charge-two-months-heres-why-i-wouldnt',
  },
  {
    phase: 'before',
    q: 'For a tenancy beginning after July 1, 2025, move-in photographs are:',
    options: [
      'A good idea, but optional',
      'Required, and required again after move-out before you repair anything',
      'Required only if the deposit exceeds one month',
      'Required only for furnished units',
    ],
    answer: 1,
    why: 'Assembly Bill 2801 wrote a photo duty into Civil Code §1950.5. Move-in photos, move-out photos taken before any repair or cleaning, and the relevant images delivered with the itemized statement.',
    cost: 'Without them, every deduction rests on your description of a room nobody else saw.',
    post: 'Sort Your Book Before You Panic',
    href: '/blog/sort-your-book-before-you-panic',
  },

  // ---- During the tenancy (10) ----
  {
    phase: 'during',
    q: 'Your lease sets a late fee of 10% of monthly rent. That fee is:',
    options: [
      'Enforceable — it is in the signed lease',
      'Enforceable up to $50',
      'Presumptively unenforceable unless it estimates your actual cost',
      'Enforceable only after a three-day notice',
    ],
    answer: 2,
    why: 'A late fee is a liquidated damages clause under Civil Code §1671. A percentage of rent measures the rent, not your cost. Charge what lateness actually costs you and keep the arithmetic.',
    cost: 'An unenforceable fee sitting on the ledger contaminates the three-day notice built on that ledger.',
    post: 'Your Late Fee Is Probably Void',
    href: '/blog/your-late-fee-is-probably-void',
  },
  {
    phase: 'during',
    q: 'Can you require that rent be paid in cash only?',
    options: [
      'Yes, if the lease says so',
      'No — except for a limited window after a bounced or stopped payment',
      'Yes, for month-to-month tenancies',
      'Only if you give written receipts',
    ],
    answer: 1,
    why: 'Civil Code §1947.3 bars a cash-only requirement except for a defined period after a dishonored payment, and requires that at least one method other than cash or electronic transfer stay available.',
    cost: 'A payment term the law does not allow gives the tenant a defense to the nonpayment case you built on it.',
    post: 'Your Late Fee Is Probably Void',
    href: '/blog/your-late-fee-is-probably-void',
  },
  {
    phase: 'during',
    q: 'You need to enter for a repair. The standard is:',
    options: [
      "Twenty-four hours' written notice, during normal business hours",
      'Verbal notice at any hour',
      "Forty-eight hours' written notice",
      'No notice if the lease warned that repairs happen',
    ],
    answer: 0,
    why: 'Civil Code §1954 presumes twenty-four hours is reasonable, requires the notice in writing, requires normal business hours, and requires you to state the purpose.',
    cost: 'Unlawful entry is a privacy claim, and it produces some of the largest awards against otherwise careful owners — including for work a vendor did in the yard.',
    post: "Thirty Feet Away Is Still Someone Else's Home",
    href: '/blog/thirty-feet-away-is-still-someone-elses-home',
  },
  {
    phase: 'during',
    q: 'A tenant complains to the building department. A rent increase is presumed retaliatory if it lands within:',
    options: ['Thirty days', 'Ninety days', 'One hundred eighty days', 'One year'],
    answer: 2,
    why: 'Civil Code §1942.5 sets a one-hundred-eighty-day presumption window. Inside it, the burden of showing an honest, non-retaliatory reason is yours.',
    cost: 'A defensible increase served in the wrong month becomes a claim you have to disprove.',
    post: "Thirty Feet Away Is Still Someone Else's Home",
    href: '/blog/thirty-feet-away-is-still-someone-elses-home',
  },
  {
    phase: 'during',
    q: 'You are raising rent by 7%. The notice required is:',
    options: [
      'Thirty days',
      'Sixty days',
      'Ninety days',
      "Thirty days plus the tenant's written consent",
    ],
    answer: 0,
    why: 'Civil Code §827 requires thirty days for increases of 10% or less within any twelve-month period, and ninety days once the increases cross 10%.',
    cost: 'The wrong notice period does not delay the increase. It voids it.',
    post: "The Increase You Didn't Take Is Gone",
    href: '/blog/the-increase-you-didnt-take-is-gone',
  },
  {
    phase: 'during',
    q: 'For a unit covered by Assembly Bill 1482, the annual cap is:',
    options: [
      'A flat 5%',
      'A flat 10%',
      '5% plus the applicable Consumer Price Index, or 10% — whichever is lower',
      'The Consumer Price Index alone',
    ],
    answer: 2,
    why: 'The formula is 5% plus the Consumer Price Index (CPI) with a hard 10% ceiling, and the lower figure governs. Which CPI applies depends on the county — Ventura County uses the statewide California figure, not the Los Angeles area figure.',
    cost: 'An increase above the cap is void as to the excess, and the overcharge is recoverable.',
    post: "The Increase You Didn't Take Is Gone",
    href: '/blog/the-increase-you-didnt-take-is-gone',
  },
  {
    phase: 'during',
    q: 'Your Oxnard rental sits under a local 4% cap. State law would allow more. You may raise rent:',
    options: [
      'To the state figure — state law preempts the city',
      'To 4% — the more restrictive local ordinance governs',
      'To the average of the two',
      'To whatever the lease provides',
    ],
    answer: 1,
    why: 'State law sets a ceiling, not a floor. A city ordinance that is more restrictive controls. Oxnard and Ojai both cap below the state figure.',
    cost: 'Owners who treat the state cap as the number they are entitled to are the ones who get the demand letter.',
    post: "The Increase You Didn't Take Is Gone",
    href: '/blog/the-increase-you-didnt-take-is-gone',
  },
  {
    phase: 'during',
    q: 'An applicant has a verified assistance animal. You may charge:',
    options: ['A pet deposit', 'Pet rent', 'Neither', "Either one, up to one month's rent"],
    answer: 2,
    why: 'An assistance animal is not a pet. No pet fee, no pet deposit, no pet rent. You may still charge for actual damage the animal causes.',
    cost: 'Charging a pet fee on an assistance animal is a fair housing claim, not a lease dispute.',
    post: 'The California Assistance Animal Checklist',
    href: '/blog/the-california-assistance-animal-checklist',
  },
  {
    phase: 'during',
    q: 'A tenant has occupied a covered unit for twelve months. Ending the tenancy now requires:',
    options: [
      "Sixty days' notice and no stated reason",
      'Just cause — and for no-fault grounds, relocation assistance',
      'A court order before any notice',
      'Just cause only in buildings of five units or more',
    ],
    answer: 1,
    why: "At twelve months of occupancy, Assembly Bill 1482's just-cause protections attach. No-fault grounds — owner move-in, substantial remodel, withdrawal from the market — carry a relocation obligation.",
    cost: 'A no-cause notice served on a protected tenancy is not a slow eviction. It is a failed one, with fees.',
    post: 'The Sentence That Decides Whether You Have an Exemption',
    href: '/blog/the-sentence-that-decides-whether-you-have-an-exemption',
  },
  {
    phase: 'during',
    q: 'You serve a no-fault termination on a covered unit. Relocation assistance owed is:',
    options: [
      'None — relocation only exists in rent-controlled cities',
      "One month's rent, unless a local ordinance requires more",
      "Two months' rent",
      'Whatever the tenant documents as moving costs',
    ],
    answer: 1,
    why: "Assembly Bill 1482 sets one month's rent for no-fault grounds — owner move-in, substantial remodel, withdrawal from the market — payable directly or waived as the final month's rent. A city ordinance that requires more governs; Oxnard's owner move-in provisions go past the state figure. And a property that is genuinely exempt, with the exemption notice actually served, owes nothing.",
    cost: 'Relocation is a condition of the notice, not a bill that follows it. Unpaid, the termination is void.',
    post: "The Increase You Didn't Take Is Gone",
    href: '/blog/the-increase-you-didnt-take-is-gone',
  },

  // ---- When it ends (3) ----
  {
    phase: 'after',
    q: 'Before the tenant moves out, you are required to:',
    options: [
      'Do nothing unless the tenant asks',
      'Notify them in writing of the right to an inspection, and on request give an itemized list of proposed deductions',
      'Inspect within twenty-one days after they leave',
      'Offer an inspection only if the deposit exceeds one month',
    ],
    answer: 1,
    why: 'The initial inspection right under Civil Code §1950.5 is yours to offer, not theirs to request. If they take it, they get an itemized list of what you intend to charge and a chance to fix it before they go.',
    cost: "Skip it and the tenant's argument writes itself: you never gave them the chance to cure the thing you charged them for.",
    post: "What You Can Still Build, and What's Gone",
    href: '/blog/what-you-can-still-build-and-whats-gone',
  },
  {
    phase: 'after',
    q: 'After move-out you have twenty-one days to:',
    options: [
      'Return the deposit balance',
      'Return the balance with an itemized statement, plus receipts or invoices for work above the statutory threshold',
      'Send an estimate of charges',
      'Return it, but only if the tenant asks in writing',
    ],
    answer: 1,
    why: 'Money alone is not compliance. The itemized statement, the supporting documents for work above the threshold, and the photographs all ride with it. If the work is not finished, a good-faith estimate goes out on time and the documents follow within fourteen days.',
    cost: 'Bad-faith retention exposes you to statutory damages of up to twice the deposit, on top of returning the deposit.',
    post: "What You Can Still Build, and What's Gone",
    href: '/blog/what-you-can-still-build-and-whats-gone',
  },
  {
    phase: 'after',
    q: 'A tenant of six years leaves worn but undamaged carpet. You may deduct:',
    options: [
      'Full replacement cost',
      'Half of replacement cost',
      'Nothing — ordinary wear and tear is not chargeable',
      'The prorated remaining useful life',
    ],
    answer: 2,
    why: 'Wear is the cost of renting the property out. Proration against useful life applies only where there is damage beyond ordinary wear, and six years of ordinary use is not damage.',
    cost: 'One bad line item is enough to put the whole itemization in front of a judge.',
    post: "What You Can Still Build, and What's Gone",
    href: '/blog/what-you-can-still-build-and-whats-gone',
  },
]
