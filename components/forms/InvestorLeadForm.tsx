// components/forms/InvestorLeadForm.tsx

'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

type InvestorInterest =
  | 'evaluating-management'
  | 'switching-manager'
  | 'buy-and-hold'
  | 'rent-vs-sell'
  | 'portfolio-growth'

type UnitsOwned = '1' | '2-4' | '5-10' | '10-plus'

type InvestorLeadFormProps = {
  title?: string
  description?: string
  buttonText?: string
}

export default function InvestorLeadForm({
  title = 'Get Investor Insights',
  description = 'Receive practical guidance for owning and managing rental property in Ventura County.',
  buttonText = 'Send Me Investor Insights',
}: InvestorLeadFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setStatus('submitting')
    setErrorMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      propertyCity: String(formData.get('propertyCity') || '').trim(),
      unitsOwned: String(formData.get('unitsOwned') || '').trim() as UnitsOwned,
      interest: String(formData.get('interest') || '').trim() as InvestorInterest,
    }

    if (!payload.firstName || !payload.lastName || !payload.email) {
      setStatus('error')
      setErrorMessage('Please enter your name and email address.')
      return
    }

    if (!payload.interest) {
      setStatus('error')
      setErrorMessage('Please select what best describes your situation.')
      return
    }

    try {
      const response = await fetch('/api/investor-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      window.location.href = data.redirectUrl || '/thank-you/investor-insights'
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit right now.'

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-neutral-800"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-neutral-800"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-800"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-neutral-800"
        >
          Phone number <span className="text-neutral-500">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        />
      </div>

      <div>
        <label
          htmlFor="propertyCity"
          className="block text-sm font-medium text-neutral-800"
        >
          Property city <span className="text-neutral-500">(optional)</span>
        </label>
        <input
          id="propertyCity"
          name="propertyCity"
          type="text"
          autoComplete="address-level2"
          placeholder="Camarillo, Oxnard, Ventura, etc."
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        />
      </div>

      <div>
        <label
          htmlFor="unitsOwned"
          className="block text-sm font-medium text-neutral-800"
        >
          How many rental units do you own?
        </label>
        <select
          id="unitsOwned"
          name="unitsOwned"
          defaultValue=""
          className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="1">1 unit</option>
          <option value="2-4">2–4 units</option>
          <option value="5-10">5–10 units</option>
          <option value="10-plus">10+ units</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="interest"
          className="block text-sm font-medium text-neutral-800"
        >
          What best describes your situation?
        </label>
        <select
          id="interest"
          name="interest"
          required
          defaultValue=""
          className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="evaluating-management">
            I am evaluating property management
          </option>
          <option value="switching-manager">
            I may switch property managers
          </option>
          <option value="buy-and-hold">
            I own or want to own long-term rentals
          </option>
          <option value="rent-vs-sell">
            I am deciding whether to rent or sell
          </option>
          <option value="portfolio-growth">
            I am growing a rental portfolio
          </option>
        </select>
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? 'Submitting...' : buttonText}
      </button>

      <p className="text-xs leading-5 text-neutral-500">
        By submitting this form, you agree to be contacted by County Property
        Management about investor insights, property management, and related
        rental ownership topics.
      </p>
    </form>
  )
}