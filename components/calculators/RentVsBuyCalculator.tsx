'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

function currency(value: number) {
  if (!Number.isFinite(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function monthlyMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
) {
  const monthlyRate = annualRate / 100 / 12
  const n = years * 12

  if (principal <= 0 || n <= 0) return 0
  if (monthlyRate === 0) return principal / n

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
}

function futureValueHome(
  homePrice: number,
  annualAppreciation: number,
  years: number
) {
  return homePrice * Math.pow(1 + annualAppreciation / 100, years)
}

function futureValueInvestment(
  monthlyContribution: number,
  annualReturn: number,
  months: number,
  initial = 0
) {
  const r = annualReturn / 100 / 12
  if (months <= 0) return initial
  if (r === 0) return initial + monthlyContribution * months

  return (
    initial * Math.pow(1 + r, months) +
    monthlyContribution * ((Math.pow(1 + r, months) - 1) / r)
  )
}

function remainingMortgageBalance(
  principal: number,
  annualRate: number,
  years: number,
  paymentsMade: number
) {
  const r = annualRate / 100 / 12
  const n = years * 12
  const pmt = monthlyMortgagePayment(principal, annualRate, years)

  if (r === 0) return Math.max(0, principal - pmt * paymentsMade)

  return Math.max(
    0,
    principal * Math.pow(1 + r, paymentsMade) -
    pmt * ((Math.pow(1 + r, paymentsMade) - 1) / r)
  )
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  optional = false,
}: {
  label: ReactNode
  value: number
  onChange: (value: number) => void
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
          type="number"
          value={value}
          min={0}
          step="any"
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={`w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black ${prefix ? 'pl-7' : ''
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

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  suffix = '%',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-[var(--cpm-text)]">{label}</label>
        <span className="text-sm text-[var(--cpm-muted)]">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-black"
      />
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
      className={`flex items-center justify-between gap-4 py-2 ${bold ? 'font-semibold text-[var(--cpm-text)]' : 'text-[var(--cpm-muted)]'
        }`}
    >
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

type ScenarioPreset = 'conservative' | 'base' | 'optimistic'

export default function RentVsBuyCalculator() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showConsultationForm, setShowConsultationForm] = useState(false)

  const [purchasePrice, setPurchasePrice] = useState(650000)
  const [cashAvailable, setCashAvailable] = useState(150000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [interestRate, setInterestRate] = useState(6.75)
  const [loanTermYears, setLoanTermYears] = useState(30)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2)
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState(1800)
  const [hoaMonthly, setHoaMonthly] = useState(0)
  const [maintenancePct, setMaintenancePct] = useState(1.0)
  const [pmiRateAnnual, setPmiRateAnnual] = useState(0.7)
  const [closingCostsBuyPct, setClosingCostsBuyPct] = useState(2.5)
  const [sellingCostsPct, setSellingCostsPct] = useState(7.0)
  const [homeAppreciationRate, setHomeAppreciationRate] = useState(3.0)
  const [upfrontRepairs, setUpfrontRepairs] = useState(0)
  const [annualMajorRepairsReserve, setAnnualMajorRepairsReserve] =
    useState(1200)
  const [buyerAgentCommissionCredit, setBuyerAgentCommissionCredit] =
    useState(0)

  const [monthlyRent, setMonthlyRent] = useState(3200)
  const [rentersInsuranceMonthly, setRentersInsuranceMonthly] = useState(20)
  const [annualRentIncrease, setAnnualRentIncrease] = useState(4.0)
  const [securityDeposit, setSecurityDeposit] = useState(3200)
  const [monthlyUtilitiesRent, setMonthlyUtilitiesRent] = useState(180)
  const [monthlyUtilitiesBuy, setMonthlyUtilitiesBuy] = useState(280)
  const [oneTimeMovingCostRent, setOneTimeMovingCostRent] = useState(1500)
  const [oneTimeMovingCostBuy, setOneTimeMovingCostBuy] = useState(2500)

  const [investmentReturnRate, setInvestmentReturnRate] = useState(6.0)
  const [analysisYears, setAnalysisYears] = useState(7)
  const [marginalTaxRate, setMarginalTaxRate] = useState(22.0)
  const [filingBenefitPct, setFilingBenefitPct] = useState(0.0)
  const [scenarioPreset, setScenarioPreset] = useState<ScenarioPreset>('base')

  const [lead, setLead] = useState({
    name: '',
    email: '',
    phone: '',
    timeline: '',
    interest: '',
  })

  const setLeadField = (key: keyof typeof lead, value: string) =>
    setLead((state) => ({ ...state, [key]: value }))

  const results = useMemo(() => {
    const scenarioAdjustments = {
      conservative: {
        appreciation: -1,
        investment: -1,
        rentGrowth: 0.5,
        maintenance: 0.25,
      },
      base: {
        appreciation: 0,
        investment: 0,
        rentGrowth: 0,
        maintenance: 0,
      },
      optimistic: {
        appreciation: 1,
        investment: 1,
        rentGrowth: -0.5,
        maintenance: -0.15,
      },
    } as const

    const selectedScenario = scenarioAdjustments[scenarioPreset]
    const adjustedAppreciation =
      homeAppreciationRate + selectedScenario.appreciation
    const adjustedInvestmentReturn =
      investmentReturnRate + selectedScenario.investment
    const adjustedRentIncrease = Math.max(
      0,
      annualRentIncrease + selectedScenario.rentGrowth
    )
    const adjustedMaintenancePct = Math.max(
      0,
      maintenancePct + selectedScenario.maintenance
    )

    const months = analysisYears * 12
    const downPayment = purchasePrice * (downPaymentPct / 100)
    const loanAmount = purchasePrice - downPayment
    const mortgagePayment = monthlyMortgagePayment(
      loanAmount,
      interestRate,
      loanTermYears
    )
    const monthlyTaxes = (purchasePrice * (propertyTaxRate / 100)) / 12
    const monthlyInsurance = homeInsuranceAnnual / 12
    const monthlyMaintenance = (purchasePrice * (adjustedMaintenancePct / 100)) / 12
    const monthlyMajorRepairsReserve = annualMajorRepairsReserve / 12
    const buyClosingCostsGross = purchasePrice * (closingCostsBuyPct / 100)
    const buyClosingCosts = Math.max(
      0,
      buyClosingCostsGross - buyerAgentCommissionCredit
    )
    const pmiMonthly =
      downPaymentPct < 20 ? (loanAmount * (pmiRateAnnual / 100)) / 12 : 0

    const totalMonthlyOwnerCost =
      mortgagePayment +
      monthlyTaxes +
      monthlyInsurance +
      hoaMonthly +
      monthlyMaintenance +
      monthlyMajorRepairsReserve +
      pmiMonthly +
      monthlyUtilitiesBuy

    let totalRentPaid = 0
    let currentRent = monthlyRent

    for (let year = 1; year <= analysisYears; year++) {
      totalRentPaid += currentRent * 12
      currentRent *= 1 + adjustedRentIncrease / 100
    }

    const totalRenterCashOut =
      totalRentPaid +
      rentersInsuranceMonthly * months +
      monthlyUtilitiesRent * months +
      oneTimeMovingCostRent

    const buyerCashNeeded =
      downPayment + buyClosingCosts + upfrontRepairs + oneTimeMovingCostBuy

    const initialRenterInvestable = Math.max(
      0,
      cashAvailable - securityDeposit - oneTimeMovingCostRent
    )

    const monthlySavingsVsOwningInitial = Math.max(
      0,
      totalMonthlyOwnerCost -
      (monthlyRent + rentersInsuranceMonthly + monthlyUtilitiesRent)
    )

    const renterInvestmentValue = futureValueInvestment(
      monthlySavingsVsOwningInitial,
      adjustedInvestmentReturn,
      months,
      initialRenterInvestable
    )

    const homeValueAtSale = futureValueHome(
      purchasePrice,
      adjustedAppreciation,
      analysisYears
    )

    const balanceAtSale = remainingMortgageBalance(
      loanAmount,
      interestRate,
      loanTermYears,
      months
    )

    const sellingCosts = homeValueAtSale * (sellingCostsPct / 100)
    const grossEquityAtSale = Math.max(
      0,
      homeValueAtSale - balanceAtSale - sellingCosts
    )

    const mortgageInterestApprox = Math.max(
      0,
      mortgagePayment * months - (loanAmount - balanceAtSale)
    )

    const standardDeductionOffsetFactor = 0.5

    const taxSavingsEstimate =
      (mortgageInterestApprox + monthlyTaxes * months) *
      (marginalTaxRate / 100) *
      (filingBenefitPct / 100) *
      standardDeductionOffsetFactor

    const ownerCashOut =
      totalMonthlyOwnerCost * months +
      downPayment +
      buyClosingCosts +
      upfrontRepairs +
      oneTimeMovingCostBuy

    const ownerNetCost = ownerCashOut - grossEquityAtSale - taxSavingsEstimate
    const renterNetCost = totalRenterCashOut - renterInvestmentValue
    const buyAdvantage = renterNetCost - ownerNetCost
    const liquidityGap = cashAvailable - buyerCashNeeded

    const breakevenYears = (() => {
      for (let years = 1; years <= 15; years++) {
        const m = years * 12
        const mr = monthlyMortgagePayment(
          loanAmount,
          interestRate,
          loanTermYears
        )
        const taxes = (purchasePrice * (propertyTaxRate / 100)) / 12
        const ins = homeInsuranceAnnual / 12
        const maint = (purchasePrice * (adjustedMaintenancePct / 100)) / 12
        const pmi =
          downPaymentPct < 20 ? (loanAmount * (pmiRateAnnual / 100)) / 12 : 0

        const ownerMonthly =
          mr +
          taxes +
          ins +
          hoaMonthly +
          maint +
          annualMajorRepairsReserve / 12 +
          pmi +
          monthlyUtilitiesBuy

        let rentTotal = 0
        let rentNow = monthlyRent

        for (let y = 1; y <= years; y++) {
          rentTotal += rentNow * 12
          rentNow *= 1 + adjustedRentIncrease / 100
        }

        const renterInvest = futureValueInvestment(
          Math.max(
            0,
            ownerMonthly -
            (monthlyRent + rentersInsuranceMonthly + monthlyUtilitiesRent)
          ),
          adjustedInvestmentReturn,
          m,
          Math.max(0, cashAvailable - securityDeposit - oneTimeMovingCostRent)
        )

        const homeSale = futureValueHome(
          purchasePrice,
          adjustedAppreciation,
          years
        )

        const loanBal = remainingMortgageBalance(
          loanAmount,
          interestRate,
          loanTermYears,
          m
        )

        const saleCosts = homeSale * (sellingCostsPct / 100)
        const equity = Math.max(0, homeSale - loanBal - saleCosts)
        const ownerOut =
          ownerMonthly * m +
          downPayment +
          buyClosingCosts +
          upfrontRepairs +
          oneTimeMovingCostBuy
        const renterOut =
          rentTotal +
          rentersInsuranceMonthly * m +
          monthlyUtilitiesRent * m +
          oneTimeMovingCostRent
        const ownerNet = ownerOut - equity
        const renterNet = renterOut - renterInvest

        if (ownerNet <= renterNet) return years
      }

      return null
    })()

    return {
      adjustedAppreciation,
      adjustedInvestmentReturn,
      adjustedRentIncrease,
      adjustedMaintenancePct,
      downPayment,
      loanAmount,
      mortgagePayment,
      monthlyTaxes,
      monthlyInsurance,
      monthlyMaintenance,
      monthlyMajorRepairsReserve,
      pmiMonthly,
      totalMonthlyOwnerCost,
      totalRentPaid,
      totalRenterCashOut,
      renterInvestmentValue,
      ownerCashOut,
      buyerCashNeeded,
      liquidityGap,
      ownerNetCost,
      renterNetCost,
      buyAdvantage,
      homeValueAtSale,
      balanceAtSale,
      grossEquityAtSale,
      taxSavingsEstimate,
      buyClosingCosts,
      breakevenYears,
    }
  }, [
    analysisYears,
    annualMajorRepairsReserve,
    annualRentIncrease,
    buyerAgentCommissionCredit,
    cashAvailable,
    closingCostsBuyPct,
    downPaymentPct,
    filingBenefitPct,
    hoaMonthly,
    homeAppreciationRate,
    homeInsuranceAnnual,
    interestRate,
    investmentReturnRate,
    loanTermYears,
    maintenancePct,
    marginalTaxRate,
    monthlyRent,
    monthlyUtilitiesBuy,
    monthlyUtilitiesRent,
    oneTimeMovingCostBuy,
    oneTimeMovingCostRent,
    pmiRateAnnual,
    propertyTaxRate,
    purchasePrice,
    rentersInsuranceMonthly,
    scenarioPreset,
    securityDeposit,
    sellingCostsPct,
    upfrontRepairs,
  ])

  const recommendation =
    results.buyAdvantage > 0
      ? 'Buying may be financially stronger'
      : 'Renting may be financially stronger'

  const recommendationDescription =
    results.buyAdvantage > 0
      ? 'This estimate suggests buying may create a stronger long-term financial outcome, but your timeline, comfort level, and local options still matter.'
      : 'This estimate suggests renting may currently be the cleaner financial move, especially if flexibility or lower upfront risk matters right now.'

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Start with the core numbers
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                This tool compares the financial side of renting versus buying
                over time. Start with the basics, then open the advanced fields
                if you want to refine the estimate.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <NumberField
                label="Home purchase price"
                value={purchasePrice}
                onChange={setPurchasePrice}
                prefix="$"
              />
              <NumberField
                label="Cash available for move or purchase"
                value={cashAvailable}
                onChange={setCashAvailable}
                prefix="$"
              />
              <NumberField
                label="Current monthly rent"
                value={monthlyRent}
                onChange={setMonthlyRent}
                prefix="$"
              />
              <NumberField
                label="Security deposit"
                value={securityDeposit}
                onChange={setSecurityDeposit}
                prefix="$"
              />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <SliderField
                label="Down payment"
                value={downPaymentPct}
                onChange={setDownPaymentPct}
                min={0}
                max={50}
                step={0.5}
              />
              <SliderField
                label="Interest rate"
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={12}
                step={0.125}
              />
              <NumberField
                label="Loan term"
                value={loanTermYears}
                onChange={setLoanTermYears}
                suffix="yr"
              />
              <NumberField
                label="Analysis period"
                value={analysisYears}
                onChange={setAnalysisYears}
                suffix="yr"
              />
            </div>

            <div className="mt-8 cpm-card rounded-2xl p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[var(--cpm-text)]">
                    Advanced assumptions
                  </h3>
                  <p className="mt-1 text-sm text-[var(--cpm-muted)]">
                    Refine taxes, insurance, rent growth, investment return, and
                    other scenario details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced((state) => !state)}
                  className="rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-2 text-sm text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
                >
                  {showAdvanced ? 'Hide advanced fields' : 'Show advanced fields'}
                </button>
              </div>

              {showAdvanced ? (
                <div className="mt-6 space-y-6">
                  <div className="cpm-card rounded-2xl p-5">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Buying assumptions
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <SliderField
                        label="Property tax rate"
                        value={propertyTaxRate}
                        onChange={setPropertyTaxRate}
                        min={0}
                        max={3}
                        step={0.05}
                      />
                      <NumberField
                        label="Annual homeowner's insurance"
                        value={homeInsuranceAnnual}
                        onChange={setHomeInsuranceAnnual}
                        prefix="$"
                      />
                      <NumberField
                        label={
                          <div className="flex items-center gap-2">
                            <span>Monthly HOA dues</span>

                            <div className="relative group">
                              <div className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-[var(--cpm-muted)] text-[10px] text-[var(--cpm-muted)]">
                                i
                              </div>

                              <div className="pointer-events-none absolute left-1/2 top-6 z-20 w-72 -translate-x-1/2 rounded-lg border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-3 text-xs leading-relaxed text-[var(--cpm-muted)] opacity-0 shadow-lg transition group-hover:opacity-100">
                                HOA dues shown here reflect current payments only. Many associations have underfunded reserves or upcoming capital expenses that can result in increased dues or special assessments. A full HOA financial review is recommended before purchasing.
                              </div>
                            </div>
                          </div>
                        }
                        value={hoaMonthly}
                        onChange={setHoaMonthly}
                        prefix="$"
                        optional
                      />
                      <SliderField
                        label="Maintenance reserve"
                        value={maintenancePct}
                        onChange={setMaintenancePct}
                        min={0}
                        max={3}
                        step={0.1}
                      />
                      <SliderField
                        label="PMI rate if under 20% down"
                        value={pmiRateAnnual}
                        onChange={setPmiRateAnnual}
                        min={0}
                        max={2}
                        step={0.05}
                      />
                      <SliderField
                        label="Buyer closing costs"
                        value={closingCostsBuyPct}
                        onChange={setClosingCostsBuyPct}
                        min={0}
                        max={5}
                        step={0.1}
                      />
                      <SliderField
                        label="Selling costs at exit"
                        value={sellingCostsPct}
                        onChange={setSellingCostsPct}
                        min={0}
                        max={10}
                        step={0.1}
                      />
                      <NumberField
                        label="Upfront repairs or improvements"
                        value={upfrontRepairs}
                        onChange={setUpfrontRepairs}
                        prefix="$"
                        optional
                      />
                      <NumberField
                        label="Annual major repairs reserve"
                        value={annualMajorRepairsReserve}
                        onChange={setAnnualMajorRepairsReserve}
                        prefix="$"
                        optional
                      />
                      <NumberField
                        label="Buyer-side closing credit"
                        value={buyerAgentCommissionCredit}
                        onChange={setBuyerAgentCommissionCredit}
                        prefix="$"
                        optional
                      />
                      <NumberField
                        label="Monthly owner utilities"
                        value={monthlyUtilitiesBuy}
                        onChange={setMonthlyUtilitiesBuy}
                        prefix="$"
                        optional
                      />
                      <SliderField
                        label="Home appreciation"
                        value={homeAppreciationRate}
                        onChange={setHomeAppreciationRate}
                        min={-3}
                        max={8}
                        step={0.25}
                      />
                    </div>
                  </div>

                  <div className="cpm-card rounded-2xl p-5">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Renting assumptions
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <NumberField
                        label="Monthly renter's insurance"
                        value={rentersInsuranceMonthly}
                        onChange={setRentersInsuranceMonthly}
                        prefix="$"
                        optional
                      />
                      <NumberField
                        label="Monthly renter utilities"
                        value={monthlyUtilitiesRent}
                        onChange={setMonthlyUtilitiesRent}
                        prefix="$"
                        optional
                      />
                      <SliderField
                        label="Annual rent increase"
                        value={annualRentIncrease}
                        onChange={setAnnualRentIncrease}
                        min={0}
                        max={10}
                        step={0.25}
                      />
                      <NumberField
                        label="One-time moving cost to rent"
                        value={oneTimeMovingCostRent}
                        onChange={setOneTimeMovingCostRent}
                        prefix="$"
                        optional
                      />
                      <NumberField
                        label="One-time moving cost to buy"
                        value={oneTimeMovingCostBuy}
                        onChange={setOneTimeMovingCostBuy}
                        prefix="$"
                        optional
                      />
                    </div>
                  </div>

                  <div className="cpm-card rounded-2xl p-5">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Scenario assumptions
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                          Scenario preset
                        </label>
                        <select
                          value={scenarioPreset}
                          onChange={(event) =>
                            setScenarioPreset(event.target.value as ScenarioPreset)
                          }
                          className="w-full rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                        >
                          <option value="conservative">Conservative</option>
                          <option value="base">Base</option>
                          <option value="optimistic">Optimistic</option>
                        </select>
                      </div>

                      <SliderField
                        label="Expected investment return"
                        value={investmentReturnRate}
                        onChange={setInvestmentReturnRate}
                        min={0}
                        max={12}
                        step={0.25}
                      />
                      <SliderField
                        label="Marginal tax rate"
                        value={marginalTaxRate}
                        onChange={setMarginalTaxRate}
                        min={0}
                        max={40}
                        step={1}
                      />
                      <SliderField
                        label="Percent of homeowner tax benefit realized"
                        value={filingBenefitPct}
                        onChange={setFilingBenefitPct}
                        min={0}
                        max={100}
                        step={5}
                        suffix="%"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              What this calculator is measuring
            </h2>

            <div className="mt-6 space-y-4 text-[var(--cpm-muted)]">
              <p>
                This version compares the estimated financial cost of renting
                versus buying over the selected time period.
              </p>
              <p>
                Buying includes down payment, mortgage, PMI when applicable,
                property tax, insurance, HOA, maintenance, major repair
                reserves, utilities, moving costs, entry closing costs,
                estimated sale proceeds, and selling costs.
              </p>
              <p>
                Renting includes rent, renter&apos;s insurance, utilities,
                moving costs, and the potential value of investing available
                cash not committed to buying.
              </p>
            </div>

            <div className="mt-6 cpm-card rounded-2xl p-4 text-sm leading-6 text-[var(--cpm-muted)]">
              This is a planning calculator, not tax, lending, or legal advice.
              Because it does not connect to live databases, the quality of the
              result depends on the assumptions used and the accuracy of the
              numbers entered.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
            <div className="rounded-2xl bg-[var(--cpm-page)] p-4">
              <div className="text-sm text-gray-500">Estimated recommendation</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--cpm-text)]">
                {recommendation}
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--cpm-muted)]">
                {recommendationDescription}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--cpm-border)] p-4">
              <div className="text-sm text-gray-500">
                Estimated financial difference
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cpm-text)]">
                {currency(Math.abs(results.buyAdvantage))}
              </div>
              <p className="mt-2 text-sm text-[var(--cpm-muted)]">
                Over {analysisYears} years, based on the assumptions entered
                into this estimate.
              </p>
            </div>

            <div className="mt-6 border-t border-[var(--cpm-border)] pt-6">
              <ResultRow
                label="Monthly cost to own"
                value={currency(results.totalMonthlyOwnerCost)}
                bold
              />
              <ResultRow
                label="Monthly cost to rent"
                value={currency(
                  monthlyRent + rentersInsuranceMonthly + monthlyUtilitiesRent
                )}
              />
              <ResultRow
                label="Cash needed to buy"
                value={currency(results.buyerCashNeeded)}
                bold
              />
              <ResultRow
                label="Cash remaining after buy"
                value={currency(results.liquidityGap)}
              />
              <ResultRow
                label="Net cost of buying"
                value={currency(results.ownerNetCost)}
                bold
              />
              <ResultRow
                label="Net cost of renting"
                value={currency(results.renterNetCost)}
              />
              <ResultRow
                label="Break-even ownership horizon"
                value={
                  results.breakevenYears
                    ? `${results.breakevenYears} years`
                    : '15+ years'
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
            <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
              Buying detail
            </h3>

            <div className="mt-6 border-t border-[var(--cpm-border)] pt-4">
              <ResultRow label="Down payment" value={currency(results.downPayment)} />
              <ResultRow label="Loan amount" value={currency(results.loanAmount)} />
              <ResultRow
                label="Mortgage payment (P&I)"
                value={currency(results.mortgagePayment)}
              />
              <ResultRow
                label="Monthly property tax"
                value={currency(results.monthlyTaxes)}
              />
              <ResultRow
                label="Monthly insurance"
                value={currency(results.monthlyInsurance)}
              />
              <ResultRow
                label="Monthly maintenance reserve"
                value={currency(results.monthlyMaintenance)}
              />
              <ResultRow
                label="Monthly major repairs reserve"
                value={currency(results.monthlyMajorRepairsReserve)}
              />
              <ResultRow label="Monthly PMI" value={currency(results.pmiMonthly)} />
              <ResultRow
                label="Estimated home value at exit"
                value={currency(results.homeValueAtSale)}
              />
              <ResultRow
                label="Mortgage balance at exit"
                value={currency(results.balanceAtSale)}
              />
              <ResultRow
                label="Estimated net equity at exit"
                value={currency(results.grossEquityAtSale)}
                bold
              />
              <ResultRow
                label="Estimated tax benefit used"
                value={currency(results.taxSavingsEstimate)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-8">
            <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
              Talk through your next step
            </h3>
            <p className="mt-3 text-[var(--cpm-muted)]">
              The numbers matter, but so do timeline, financing comfort,
              neighborhood fit, and whether buying now aligns with your broader
              goals.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowConsultationForm((state) => !state)}
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                {showConsultationForm
                  ? 'Hide consultation form'
                  : 'Schedule a Rent vs Buy Consultation'}
              </button>

              <a
                href="/contact"
                className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
              >
                Contact CPM
              </a>
            </div>

            {showConsultationForm ? (
              <div className="mt-6 cpm-card rounded-2xl p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                      Name
                    </label>
                    <input
                      value={lead.name}
                      onChange={(event) =>
                        setLeadField('name', event.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={lead.email}
                      onChange={(event) =>
                        setLeadField('email', event.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={lead.phone}
                      onChange={(event) =>
                        setLeadField('phone', event.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                      Timeline
                    </label>
                    <select
                      value={lead.timeline}
                      onChange={(event) =>
                        setLeadField('timeline', event.target.value)
                      }
                      className="w-full rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                    >
                      <option value="">Select</option>
                      <option value="0-6-months">0–6 months</option>
                      <option value="6-12-months">6–12 months</option>
                      <option value="1-2-years">1–2 years</option>
                      <option value="just-exploring">Just exploring</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[var(--cpm-text)]">
                      What are you looking for?
                    </label>
                    <select
                      value={lead.interest}
                      onChange={(event) =>
                        setLeadField('interest', event.target.value)
                      }
                      className="w-full rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
                    >
                      <option value="">Select</option>
                      <option value="buying-soon">Buying soon</option>
                      <option value="just-exploring">Just exploring</option>
                      <option value="want-agent-connection">
                        Want agent connection
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4">
                  <a
                    href="/contact"
                    className="btn-primary inline-flex"
                  >
                    Submit Consultation Request
                  </a>
                </div>
              </div>
            ) : null}

            <p className="mt-6 text-xs leading-5 text-gray-500">
              This calculator is meant to start a conversation, not replace
              lending, tax, or legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}