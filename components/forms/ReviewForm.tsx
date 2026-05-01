'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'error'

export default function ReviewForm() {
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
      rating: formData.get('rating'),
      comments: formData.get('comments'),
    }

    try {
      const response = await fetch('/api/reviews', {
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
          : 'Unable to submit feedback right now.'

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
          <input name="phone" type="text" className="cpm-input mt-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium cpm-field-label">
          Rating
        </label>
        <select
          name="rating"
          required
          defaultValue=""
          className="cpm-input mt-2"
        >
          <option value="" disabled>
            Choose a rating
          </option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Fair</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Very Poor</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium cpm-field-label">
          Comments
        </label>
        <textarea
          name="comments"
          className="cpm-input mt-2 min-h-[140px]"
          placeholder="Tell us about your experience."
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
        {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  )
}