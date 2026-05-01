'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

export default function ContactForm() {
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
      message: formData.get('message'),
    }

    try {
      const response = await fetch('/api/contact', {
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
          : 'Unable to submit contact form right now.'

      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            required
            className="cpm-input mt-2"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            Phone
          </label>
          <input
            name="phone"
            type="text"
            className="cpm-input mt-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium cpm-field-label">
          Message
        </label>
        <textarea
          name="message"
          required
          className="cpm-input mt-2 min-h-[160px]"
          placeholder="How can we help?"
        />
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
        {status === 'submitting' ? 'Submitting...' : 'Send Inquiry'}
      </button>
    </form>
  )
}