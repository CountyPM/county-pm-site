'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

export default function LeadMagnetForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(event.currentTarget)

    const payload = {
      firstName: formData.get('firstName'),
      email: formData.get('email'),
      interest: 'rent-vs-sell',
    }

    try {
      const response = await fetch('/api/lead-magnet', {
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

      alert('Check your email for the guide!')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit right now.'

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <div className="cpm-card rounded-2xl p-8">
      <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
        Get the Rent vs Sell Guide
      </h3>
      <p className="mt-3 text-[var(--cpm-muted)]">
        Enter your info and we’ll send it instantly.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          required
          className="w-full rounded border border-gray-300 px-4 py-3"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border border-gray-300 px-4 py-3"
        />

        {errorMessage && (
          <div className="text-sm text-red-600">{errorMessage}</div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded btn-primary px-5 py-3 text-white"
        >
          {status === 'submitting'
            ? 'Submitting...'
            : 'Get the Guide'}
        </button>
      </form>
    </div>
  )
}