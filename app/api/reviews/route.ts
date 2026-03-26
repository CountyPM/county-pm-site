import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

async function upsertReviewContact(payload: {
  firstName: string
  lastName: string
  email: string
  phone: string
  rating: number
  comments: string
}) {
  const locationId = requiredEnv('GHL_LOCATION_ID')
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

  const reviewTag = payload.rating >= 4 ? 'review_positive' : 'review_negative'

  const response = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      tags: [reviewTag],
      source: 'Website Review Form',
    }),
  })

  const data = await response.json().catch(() => ({}))
  console.log('GHL review upsert response:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    throw new Error(
      `GHL review upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = ['firstName', 'lastName', 'email', 'rating'] as const

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const rating = Number(body.rating)

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5.' },
        { status: 400 }
      )
    }

    const submission = {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      phone: body.phone ? String(body.phone).trim() : '',
      rating,
      comments: body.comments ? String(body.comments).trim() : '',
    }

    await upsertReviewContact(submission)

    if (rating >= 4) {
      return NextResponse.json({
        ok: true,
        redirectUrl: 'https://g.page/r/CQdtGMFNiTTaEAI/review',
      })
    }

    return NextResponse.json({
      ok: true,
      redirectUrl: '/thank-you/review-internal',
    })
  } catch (error) {
    console.error('Review API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit feedback right now.' },
      { status: 500 }
    )
  }
}