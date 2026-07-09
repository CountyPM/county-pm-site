import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const dir = '/sessions/affectionate-friendly-tesla/mnt/county-pm-site/content/faq-reconcile';

// entry__post (filename without .md) -> { type, note }
const NOTES = {
  'are-self-service-showings-safe-for-my-rental-property__self-service-showings-with-rently.com': {
    type: 'additive',
    note: "Our 2026 walkthrough of how we run Rently self-guided showings adds operational color to the safety answer: a prospect verifies identity and a payment/credit method before any access code is issued, the unit is vacant during the tour, and every entry is logged. Takeaway (2026): the safety case rests on the screening that happens before the door ever opens, not on someone standing in the room.",
  },
  'can-a-landlord-charge-a-pet-deposit-or-pet-rent-for-an__why-good-tenants-keep-getting-rejected': {
    type: 'additive',
    note: "A 2026 post on tenant screening reinforces the rule that an assistance animal is not a pet: no pet deposit and no pet rent may be charged for a verified emotional support animal, though the tenant stays liable for any actual damage. Takeaway: keep the ESA accommodation and the money questions separate from your ordinary pet policy.",
  },
  'can-ai-manage-a-rental-property-on-its-own__the-robot-cant-read-the-room': {
    type: 'additive',
    note: "Our 2026 essay on AI's ceiling in property management adds the lived examples behind the answer: AI drafts notices and summarizes ordinances well, but it cannot weigh a four-year, always-on-time tenant's history against a one-time payroll delay, and it cannot carry liability for a mis-served notice. Takeaway: AI handles tasks; it does not handle situations or accountability.",
  },
  'can-i-see-my-rental-propertys-financial-reports-online__most-property-managers-work-for-themselves': {
    type: 'additive',
    note: "A 2026 post confirms the specifics behind the answer: CPM runs on AppFolio, with owner financial reports available 24/7 and rent collection automated. Takeaway: you should be able to see where your money is without having to call anyone.",
  },
  'can-i-turn-my-home-into-a-rental-after-i-move-out__the-decade-dividend': {
    type: 'additive',
    note: "The Decade Dividend (2026) adds the financing angle: when you move out and rent the home you bought as an owner-occupant, you keep the owner-occupied loan and rate you originally locked — there is no requirement to refinance into a costlier investor loan. Takeaway: the rate you secured as a resident is one of the biggest advantages of converting the home rather than selling it.",
  },
  'do-i-need-a-20-down-payment-to-buy-a-home__the-cheap-rent-trap': {
    type: 'additive',
    note: "A 2026 post reinforces the answer with the FHA 203(b) path: as little as 3.5% down, not 20%. Takeaway: the 20% figure is a myth for many buyers — run the 3.5%-down numbers before assuming you are priced out.",
  },
  'how-can-i-buy-property-if-i-cant-afford-it-on-my-own__the-cheap-rent-trap': {
    type: 'additive',
    note: "A 2026 post adds the pooling strategy: buy a multi-family property with one or two trusted partners, live in one unit, and let the rent from the others carry the mortgage — or, for parents, help the kids with entry costs now so compounding starts early. Takeaway: partnering and house-hacking are long-proven ways onto the ladder when a solo purchase is not realistic.",
  },
  'how-can-i-move-my-rental-property-equity-out-of-california__getting-your-money-out-of-california': {
    type: 'additive',
    note: "Getting Your Money Out of California (2026) walks a real owner through the full sequence — a revocable living trust first, a CPA check on any primary-residence capital-gains exclusion, then a forward 1031 exchange through a qualified intermediary into lower-cost out-of-state doors. The post's '60 days' is the notice period for the month-to-month tenant on sale, not a 1031 deadline; the exchange's 45-day identification and 180-day closing windows are unchanged. Takeaway (2026): the 1031 deadlines stand — the new context is sequencing the trust, CPA, and tenant handling around the exchange.",
  },
  'how-do-self-service-self-guided-rental-showings-work__self-service-showings-with-rently.com': {
    type: 'additive',
    note: "Our 2026 Rently walkthrough adds the step-by-step the answer describes: the prospect registers and verifies ID plus a payment method, receives a time-boxed access code, tours the vacant unit alone, and every entry is logged. Takeaway: self-guided showings widen access hours while keeping a verified identity behind every visit.",
  },
  'how-does-a-fixed-rate-mortgage-protect-against-inflation__the-rainy-day-trap': {
    type: 'additive',
    note: "The Rainy Day Trap (2026) adds the mechanism behind the answer: a fixed-rate mortgage freezes your largest cost in today's dollars while rents rise and the real value of the debt erodes as inflation runs — in effect a short position on the dollar. Takeaway: the fixed payment is the hedge, and the longer inflation runs the more the spread works for the owner.",
  },
  'how-important-is-tenant-screening-to-a-rental-propertys__most-property-managers-work-for-themselves': {
    type: 'additive',
    note: "A 2026 post sharpens the answer: the tenant you place determines maintenance, on-time rent, and whether you ever see eviction court — which is why CPM screens every applicant personally (earnings, credit, landlord references, criminal and eviction history) and reviews each file with the owner. Takeaway: screening, more than the property analysis, is where returns are won or lost.",
  },
  'is-a-3x-income-to-rent-ratio-a-legal-requirement-for-tenants__why-good-tenants-keep-getting-rejected': {
    type: 'additive',
    note: "A 2026 screening post reinforces that the 3x income-to-rent figure is a common underwriting guideline, not a statute, and should be applied consistently alongside other compensating factors. Takeaway: use 3x as one screening signal applied evenly, not as a legal cutoff.",
  },
  'is-hiring-a-property-manager-worth-it-for-a-single-rental__what-do-property-management-companies-do': {
    type: 'additive',
    note: "A 2026 overview of what a management company actually does — marketing, screening, maintenance, rent collection, owner reporting — adds the scope behind the answer. Takeaway: even for a single rental, the value is offloading the recurring landlord duties and the compliance exposure that come with the property.",
  },
  'should-i-rent-or-buy-during-a-major-life-transition-like-a__when-decisions-overwhelm': {
    type: 'additive',
    note: "When Decisions Overwhelm (2026) adds the human dimension the answer points to: during a divorce or similar upheaval, decision fatigue — not the market — is often the real obstacle, and there is no penalty for renting first and buying once your footing returns. Takeaway: in a major transition, give yourself room to decide; renting now does not foreclose buying later.",
  },
  'should-i-use-ai-tools-to-help-self-manage-my-rentals__the-robot-cant-read-the-room': {
    type: 'additive',
    note: "Our 2026 AI essay supports the answer: lean on AI for the mechanical layer — drafting, tracking, research, first-pass tenant communication — but do not let it substitute for judgment on notices, screening, and tenant relationships. Takeaway: use AI to save time on tasks; keep a human on the decisions that carry liability.",
  },
  'what-does-a-property-management-company-do__what-do-property-management-companies-do': {
    type: 'additive',
    note: "A 2026 post restates the core scope in CPM's words: market listings, screen tenants, handle maintenance, collect rent, and report to owners — full-service management aimed at hitting the owner's revenue expectations. Takeaway: the job is to let owners enjoy the income without the day-to-day headaches.",
  },
  'what-does-it-take-to-win-an-eviction-for-non-payment-of-rent__cash-for-keys-when-the-court-fails': {
    type: 'additive',
    note: "Cash for Keys: When the Courts Fail Everyone (2026) adds a cautionary case to the answer: accepting any payment — even a partial auto-payment posted by a tenant portal — can invalidate a 3-Day Notice and reset the clock, and the tenant's formal response can add months. Takeaway: airtight documentation and clean service are what make a non-payment case winnable; small missteps restart it.",
  },
  'what-does-it-take-to-win-an-eviction-for-non-payment-of-rent__most-property-managers-work-for-themselves': {
    type: 'additive',
    note: "A 2026 post adds the prevention side of the answer: a four-decade record of never losing a non-payment eviction rests on documentation from day one and screening done right, so the strongest cases are built long before court. Takeaway: winning the eviction starts at the application, not at the courthouse.",
  },
  'what-happens-to-existing-tenant-leases-when-i-sell-my-rental__getting-your-money-out-of-california': {
    type: 'additive',
    note: "Getting Your Money Out of California (2026) restates the answer in plain terms: leases are contracts that transfer with the property, so a fixed-term tenant stays on under the new owner, and a month-to-month tenant is handled with proper notice. Takeaway: selling does not void leases — the buyer steps into them.",
  },
  'what-is-cash-for-keys__cash-for-keys-when-the-court-fails': {
    type: 'additive',
    note: "Our 2026 case study illustrates the definition: a negotiated payment for the tenant to vacate voluntarily, which became the cheaper, faster path once court delays and legal fees stacked up. Takeaway: cash for keys trades a known, smaller payment now for the cost and uncertainty of a contested eviction.",
  },
  'what-is-the-risk-of-a-mistake-in-a-california-eviction-notice__the-robot-cant-read-the-room': {
    type: 'additive',
    note: "Our 2026 AI essay underscores the answer: one procedural error — wrong date, wrong statutory language, wrong service method — restarts the whole process, and the exposure is sharper in just-cause cities like Oxnard. Takeaway: in a California eviction the sequence and accuracy of each step matter as much as the grounds themselves.",
  },
  'what-landlord-responsibilities-come-with-owning-a-rental__what-do-property-management-companies-do': {
    type: 'additive',
    note: "A 2026 overview frames the responsibilities the answer lists — maintenance, rent collection, tenant relations, compliance — as exactly the recurring duties owners take on the day they rent a property out. Takeaway: owning a rental is an ongoing operating role, which is precisely what a manager exists to absorb.",
  },
  'why-are-owner-occupied-mortgage-rates-better-than-investor__the-decade-dividend': {
    type: 'additive',
    note: "The Decade Dividend (2026) puts numbers behind the answer: owner-occupied loans allow roughly 3.5–5% down at the best available rate, while investor loans typically require 20–25% down and carry a 0.5–1%+ rate premium — and an owner-occupant who later rents the home keeps the better rate. Takeaway: lenders price owner-occupied risk lower, and that advantage carries forward if the home becomes a rental.",
  },
  'why-does-vacancy-hurt-rental-returns-so-much__most-property-managers-work-for-themselves': {
    type: 'additive',
    note: "A 2026 post sharpens the answer: every day a unit sits empty is revenue you never recover, so when notice comes the clock starts — assessment, make-ready, marketing, showings — using vetted vendors to turn the unit fast. Takeaway: vacancy is lost NOI that cannot be earned back, which is why speed at turnover matters more than chasing the cheapest make-ready.",
  },
  'why-might-cash-for-keys-cost-less-than-a-formal-eviction__cash-for-keys-when-the-court-fails': {
    type: 'additive',
    note: "Our 2026 case study quantifies the answer: roughly five months of court delays and about $2,450 in legal fees made paying the tenant to leave the cheaper outcome. Takeaway: the real comparison is not payment vs. nothing — it is a known cash-for-keys figure vs. months of lost rent plus legal costs and uncertainty.",
  },
};

let patched = 0, skipped = 0;
const problems = [];
for (const [key, val] of Object.entries(NOTES)) {
  const fp = path.join(dir, key + '.md');
  if (!fs.existsSync(fp)) { problems.push(`MISSING: ${key}`); continue; }
  const raw = fs.readFileSync(fp, 'utf8');
  const parsed = matter(raw);
  if (parsed.data.status !== 'draft') { skipped++; continue; }
  parsed.data.status = 'confirmed';
  parsed.data.proposed = parsed.data.proposed || {};
  parsed.data.proposed.type = val.type;
  parsed.data.proposed.note = val.note;
  parsed.data.proposed.post = parsed.data.proposed.post || key.split('__')[1];
  const out = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(fp, out, 'utf8');
  patched++;
}
console.log('patched:', patched, 'skipped(non-draft):', skipped);
if (problems.length) console.log('PROBLEMS:', problems);
