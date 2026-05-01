'use client'

import { useMemo, useState } from 'react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)

const toNumber = (value: string | number) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  optional = false,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  prefix?: string
  suffix?: string
  optional?: boolean
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-medium text-[var(--cpm-text)]">{label}</label>
        {optional ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
            Optional
          </span>
        ) : null}
      </div>

      <div className="relative">
        {prefix ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {prefix}
          </span>
        ) : null}

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black ${
            prefix ? 'pl-7' : ''
          } ${suffix ? 'pr-10' : ''}`}
        />

        {suffix ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${
        bold ? 'font-semibold text-[var(--cpm-text)]' : 'text-[var(--cpm-muted)]'
      }`}
    >
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default function RentVsSellCalculator() {
  const [showOptional, setShowOptional] = useState(false)
  const [conservativeMode, setConservativeMode] = useState(true)

  const [inputs, setInputs] = useState({
    homeValue: '850000',
    mortgageBalance: '420000',
    monthlyPayment: '3200',
    propertyAddress: '',
    rentLow: '4000',
    rentHigh: '4400',
    monthlyHoa: '0',
    monthlyUtilities: '0',
    monthlyOther: '150',
    sellingCostRate: '7',
    annualAppreciation: '3',
    annualRentGrowth: '3',
    annualExpenseGrowth: '3',
    managementRate: '8',
    vacancyRate: '5',
    maintenanceRate: '8',
    capExRate: '5',
    analysisYears: '3',
    estimatedRepairsToSell: '0',
    sellerCredits: '0',
  })

  const setInput = (key: string, value: string) =>
    setInputs((state) => ({ ...state, [key]: value }))

  const results = useMemo(() => {
    const homeValue = toNumber(inputs.homeValue)
    const mortgageBalance = toNumber(inputs.mortgageBalance)
    const monthlyPayment = toNumber(inputs.monthlyPayment)
    const rentLow = toNumber(inputs.rentLow)
    const rentHigh = toNumber(inputs.rentHigh)
    const rentAvg = (rentLow + rentHigh) / 2
    const monthlyHoa = toNumber(inputs.monthlyHoa)
    const monthlyUtilities = toNumber(inputs.monthlyUtilities)
    const monthlyOther = toNumber(inputs.monthlyOther)
    const estimatedRepairsToSell = toNumber(inputs.estimatedRepairsToSell)
    const sellerCredits = toNumber(inputs.sellerCredits)
    const analysisYears = Math.max(1, Math.round(toNumber(inputs.analysisYears)))

    const sellingCostRate = toNumber(inputs.sellingCostRate) / 100
    const annualAppreciation = toNumber(inputs.annualAppreciation) / 100
    const annualRentGrowth = toNumber(inputs.annualRentGrowth) / 100
    const annualExpenseGrowth = toNumber(inputs.annualExpenseGrowth) / 100

    const vacancyRate = conservativeMode
      ? Math.max(toNumber(inputs.vacancyRate) / 100, 0.05)
      : toNumber(inputs.vacancyRate) / 100

    const managementRate = conservativeMode
      ? Math.max(toNumber(inputs.managementRate) / 100, 0.08)
      : toNumber(inputs.managementRate) / 100

    const maintenanceRate = conservativeMode
      ? Math.max(toNumber(inputs.maintenanceRate) / 100, 0.08)
      : toNumber(inputs.maintenanceRate) / 100

    const capExRate = conservativeMode
      ? Math.max(toNumber(inputs.capExRate) / 100, 0.05)
      : toNumber(inputs.capExRate) / 100

    const annualGrossRent = rentAvg * 12
    const annualVacancyLoss = annualGrossRent * vacancyRate
    const effectiveGrossIncome = annualGrossRent - annualVacancyLoss
    const annualManagement = effectiveGrossIncome * managementRate
    const annualMaintenance = annualGrossRent * maintenanceRate
    const annualCapEx = annualGrossRent * capExRate
    const annualHoa = monthlyHoa * 12
    const annualUtilities = monthlyUtilities * 12
    const annualOther = monthlyOther * 12
    const annualDebtService = monthlyPayment * 12

    const annualOperatingExpenses =
      annualManagement +
      annualMaintenance +
      annualCapEx +
      annualHoa +
      annualUtilities +
      annualOther

    const annualCashFlow =
      effectiveGrossIncome - annualOperatingExpenses - annualDebtService

    const monthlyCashFlow = annualCashFlow / 12

    const sellCostsToday =
      homeValue * sellingCostRate + estimatedRepairsToSell + sellerCredits

    const netProceedsIfSoldNow = homeValue - sellCostsToday - mortgageBalance

    let futureHomeValue = homeValue
    let futureRent = rentAvg
    let futureAnnualCashFlow = 0
    let expenseMultiplier = 1

    for (let year = 1; year <= analysisYears; year++) {
      futureHomeValue *= 1 + annualAppreciation

      const grossRentYear = futureRent * 12
      const vacancyYear = grossRentYear * vacancyRate
      const effectiveYear = grossRentYear - vacancyYear
      const managementYear = effectiveYear * managementRate
      const maintenanceYear = grossRentYear * maintenanceRate * expenseMultiplier
      const capExYear = grossRentYear * capExRate * expenseMultiplier
      const hoaYear = annualHoa * expenseMultiplier
      const utilitiesYear = annualUtilities * expenseMultiplier
      const otherYear = annualOther * expenseMultiplier

      const annualExpensesYear =
        managementYear +
        maintenanceYear +
        capExYear +
        hoaYear +
        utilitiesYear +
        otherYear

      futureAnnualCashFlow +=
        effectiveYear - annualExpensesYear - annualDebtService

      futureRent *= 1 + annualRentGrowth
      expenseMultiplier *= 1 + annualExpenseGrowth
    }

    const futureSellCosts = futureHomeValue * sellingCostRate
    const estimatedValueIfKept =
      futureHomeValue - futureSellCosts - mortgageBalance + futureAnnualCashFlow

    const estimatedValueIfSold =
      netProceedsIfSoldNow * Math.pow(1.05, analysisYears)

    const advantage = estimatedValueIfKept - estimatedValueIfSold

    let recommendation = 'Close call — get a custom rent analysis'

    if (monthlyCashFlow > 250 && advantage > 15000) {
      recommendation = 'Keeping it as a rental looks promising'
    }

    if (monthlyCashFlow < 0 && advantage < -15000) {
      recommendation = 'Selling may be the cleaner choice'
    }

    return {
      rentAvg,
      monthlyCashFlow,
      annualGrossRent,
      annualOperatingExpenses,
      annualDebtService,
      annualCashFlow,
      netProceedsIfSoldNow,
      estimatedValueIfKept,
      estimatedValueIfSold,
      advantage,
      recommendation,
    }
  }, [inputs, conservativeMode])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              Calculator inputs
            </h2>
            <p className="mt-2 text-[var(--cpm-muted)]">
              Start with the basics, then add optional details if you want a more
              tailored estimate.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConservativeMode((state) => !state)}
            className="cpm-card rounded-2xl px-4 py-3 text-sm text-[var(--cpm-muted)] transition hover:bg-[var(--cpm-surface)]"
          >
            Conservative mode: {conservativeMode ? 'On' : 'Off'}
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field
            label="Estimated home value"
            value={inputs.homeValue}
            onChange={(value) => setInput('homeValue', value)}
            prefix="$"
          />
          <Field
            label="Mortgage balance"
            value={inputs.mortgageBalance}
            onChange={(value) => setInput('mortgageBalance', value)}
            prefix="$"
          />
          <Field
            label="Monthly mortgage payment"
            value={inputs.monthlyPayment}
            onChange={(value) => setInput('monthlyPayment', value)}
            prefix="$"
          />
          <Field
            label="Property address"
            value={inputs.propertyAddress}
            onChange={(value) => setInput('propertyAddress', value)}
          />
          <Field
            label="Low rent estimate"
            value={inputs.rentLow}
            onChange={(value) => setInput('rentLow', value)}
            prefix="$"
          />
          <Field
            label="High rent estimate"
            value={inputs.rentHigh}
            onChange={(value) => setInput('rentHigh', value)}
            prefix="$"
          />
        </div>

        <div className="mt-8 cpm-card rounded-2xl p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--cpm-text)]">
                Optional fields for better accuracy
              </h3>
              <p className="mt-1 text-sm text-[var(--cpm-muted)]">
                Add more details if you want a more realistic estimate.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowOptional((state) => !state)}
              className="rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-2 text-sm text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
            >
              {showOptional ? 'Hide optional fields' : 'Show optional fields'}
            </button>
          </div>

          {showOptional ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Monthly HOA"
                value={inputs.monthlyHoa}
                onChange={(value) => setInput('monthlyHoa', value)}
                prefix="$"
                optional
              />
              <Field
                label="Monthly utilities paid by owner"
                value={inputs.monthlyUtilities}
                onChange={(value) => setInput('monthlyUtilities', value)}
                prefix="$"
                optional
              />
              <Field
                label="Other monthly ownership costs"
                value={inputs.monthlyOther}
                onChange={(value) => setInput('monthlyOther', value)}
                prefix="$"
                optional
              />
              <Field
                label="Vacancy rate"
                value={inputs.vacancyRate}
                onChange={(value) => setInput('vacancyRate', value)}
                suffix="%"
                optional
              />
              <Field
                label="Management fee"
                value={inputs.managementRate}
                onChange={(value) => setInput('managementRate', value)}
                suffix="%"
                optional
              />
              <Field
                label="Maintenance reserve"
                value={inputs.maintenanceRate}
                onChange={(value) => setInput('maintenanceRate', value)}
                suffix="%"
                optional
              />
              <Field
                label="Capital expenditure reserve"
                value={inputs.capExRate}
                onChange={(value) => setInput('capExRate', value)}
                suffix="%"
                optional
              />
              <Field
                label="Annual rent growth"
                value={inputs.annualRentGrowth}
                onChange={(value) => setInput('annualRentGrowth', value)}
                suffix="%"
                optional
              />
              <Field
                label="Annual expense growth"
                value={inputs.annualExpenseGrowth}
                onChange={(value) => setInput('annualExpenseGrowth', value)}
                suffix="%"
                optional
              />
              <Field
                label="Years to compare"
                value={inputs.analysisYears}
                onChange={(value) => setInput('analysisYears', value)}
                suffix="yrs"
                optional
              />
              <Field
                label="Estimated selling costs"
                value={inputs.sellingCostRate}
                onChange={(value) => setInput('sellingCostRate', value)}
                suffix="%"
                optional
              />
              <Field
                label="Repairs or prep to sell"
                value={inputs.estimatedRepairsToSell}
                onChange={(value) => setInput('estimatedRepairsToSell', value)}
                prefix="$"
                optional
              />
              <Field
                label="Seller credits or concessions"
                value={inputs.sellerCredits}
                onChange={(value) => setInput('sellerCredits', value)}
                prefix="$"
                optional
              />
              <Field
                label="Annual appreciation"
                value={inputs.annualAppreciation}
                onChange={(value) => setInput('annualAppreciation', value)}
                suffix="%"
                optional
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
          <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">Your result</h2>

          <div className="mt-6 rounded-2xl bg-[var(--cpm-page)] p-4">
            <div className="text-sm text-gray-500">Estimated recommendation</div>
            <div className="mt-2 text-xl font-semibold text-[var(--cpm-text)]">
              {results.recommendation}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--cpm-border)] p-4">
            <div className="text-sm text-gray-500">
              Estimated monthly rental cash flow
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cpm-text)]">
              {currency(results.monthlyCashFlow)}
            </div>
            <p className="mt-2 text-sm text-[var(--cpm-muted)]">
              Based on an estimated rent midpoint of {currency(results.rentAvg)}.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--cpm-border)] p-4">
            <div className="text-sm text-gray-500">
              Estimated {inputs.analysisYears}-year advantage
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cpm-text)]">
              {currency(Math.abs(results.advantage))}
            </div>
            <p className="mt-2 text-sm text-[var(--cpm-muted)]">
              {results.advantage >= 0
                ? 'Keeping the home as a rental comes out ahead in this estimate.'
                : 'Selling the home comes out ahead in this estimate.'}
            </p>
          </div>

          <div className="mt-6 border-t border-[var(--cpm-border)] pt-6">
            <ResultRow
              label="Net proceeds if sold now"
              value={currency(results.netProceedsIfSoldNow)}
              bold
            />
            <ResultRow
              label="Estimated annual rent"
              value={currency(results.annualGrossRent)}
            />
            <ResultRow
              label="Estimated annual operating costs"
              value={currency(results.annualOperatingExpenses)}
            />
            <ResultRow
              label="Estimated annual mortgage payments"
              value={currency(results.annualDebtService)}
            />
            <ResultRow
              label="Estimated annual rental cash flow"
              value={currency(results.annualCashFlow)}
              bold
            />
            <ResultRow
              label="Estimated value if kept as rental"
              value={currency(results.estimatedValueIfKept)}
            />
            <ResultRow
              label="Estimated value if sold now"
              value={currency(results.estimatedValueIfSold)}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-8">
          <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
            Want a more precise answer?
          </h3>
          <p className="mt-3 text-[var(--cpm-muted)]">
            A calculator can help you frame the decision. A custom rent analysis
            can help you pressure-test it against your actual property, market,
            and management assumptions.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
            >
              Request a Custom Review
            </a>
            <a
              href="/property-strategy-session"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
            >
              Book a Strategy Session
            </a>
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-500">
            This tool is a homeowner-friendly estimate. It is not tax, legal,
            lending, or appraisal advice.
          </p>
        </div>
      </div>
    </div>
  )
}