'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

type BlogLeadFormProps = {
  title?: string
  description?: string
  buttonText?: string
  endpoint?: string
}

export default function BlogLeadForm({
  title = 'Get helpful property insights by email',
  description = 'Join our list to receive practical owner guidance, market insights, and decision-making resources.',
  buttonText = 'Get Updates',
  endpoint = '/api/blog-lead',
}: BlogLeadFormProps) {
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
      interest:
        endpoint === '/api/lead-magnet'
          ? 'rent-vs-sell'
          : formData.get('interest'),
    }

    try {
      const response = await fetch(endpoint, {
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
          : 'Unable to submit right now.'

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <div className="cpm-card rounded-2xl p-8">
      <h3 className="text-2xl font-semibold cpm-heading">{title}</h3>
      <p className="mt-3 cpm-copy">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium cpm-field-label">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            required
            className="cpm-input mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium cpm-field-label">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="cpm-input mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium cpm-field-label">
            Primary Interest
          </label>
          <select
            name="interest"
            required
            defaultValue=""
            className="cpm-input mt-2"
          >
            <option value="" disabled>
              Choose one
            </option>
            <option value="owner-strategy">Owner Strategy</option>
            <option value="property-management">Property Management</option>
            <option value="rent-vs-sell">Rent vs Sell</option>
            <option value="agent-partnerships">Agent Partnerships</option>
          </select>
        </div>

        {errorMessage && (
          <div className="rounded border border-red-300 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-primary w-full disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting...' : buttonText}
        </button>
      </form>
    </div>
  )
}