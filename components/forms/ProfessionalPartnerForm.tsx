'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

export default function ProfessionalPartnerForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)

    const payload = {
      name: String(formData.get('name') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      role: String(formData.get('role') || '').trim(),
      license: String(formData.get('license') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    }

    try {
      const response = await fetch('/api/professional-partners', {
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

      window.location.href =
        data.redirectUrl || '/thank-you/professional-partners'
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit right now.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue=""
            className="mt-2 w-full rounded border border-gray-300 bg-[var(--cpm-surface)] px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          >
            <option value="" disabled>
              Select a role
            </option>
            <option value="cpa">CPA</option>
            <option value="attorney">Attorney</option>
            <option value="loan-officer">Loan Officer</option>
            <option value="wealth-manager">Wealth Manager</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="license"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            License (optional)
          </label>
          <input
            id="license"
            name="license"
            type="text"
            className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--cpm-text)]"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--cpm-text)]"
        >
          Message / Notes
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3 text-[var(--cpm-text)] outline-none transition focus:border-black"
        />
      </div>

      {status === 'error' ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center rounded btn-primary px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}