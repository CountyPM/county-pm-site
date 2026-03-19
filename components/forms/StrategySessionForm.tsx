'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

export default function StrategySessionForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)

    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      propertyAddress: formData.get('propertyAddress'),
      decisionIntent: formData.get('decisionIntent'),
      notes: formData.get('notes'),
    }

    try {
      const response = await fetch('/api/strategy-session', {
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

      window.location.href = data.redirectUrl
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit form right now.'

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          name="firstName"
          type="text"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          name="lastName"
          type="text"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          name="phone"
          type="text"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Property Address
        </label>
        <input
          name="propertyAddress"
          type="text"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Are you leaning toward selling, renting, holding, or still deciding?
        </label>
        <select
          name="decisionIntent"
          required
          className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
          defaultValue=""
        >
          <option value="" disabled>
            Choose one
          </option>
          <option value="selling">Selling</option>
          <option value="renting">Renting</option>
          <option value="holding">Holding</option>
          <option value="still-deciding">Still deciding</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="notes"
          className="mt-2 min-h-[140px] w-full rounded border border-gray-300 px-4 py-3"
          placeholder="Tell us a little about your situation."
        />
      </div>

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded bg-black px-5 py-3 text-white disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting...' : 'Continue'}
      </button>
    </form>
  )
}