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

async function upsertBlogLead(payload: {
  firstName: string
  email: string
  interest: string
}) {
  const locationId = requiredEnv('GHL_LOCATION_ID')
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

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
      email: payload.email,
      tags: ['blog_lead', payload.interest],
      source: 'Website Blog Lead Form',
    }),
  })

  const data = await response.json().catch(() => ({}))
  console.log('GHL blog lead upsert response:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    throw new Error(
      `GHL blog lead upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = ['firstName', 'email', 'interest'] as const

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const submission = {
      firstName: String(body.firstName).trim(),
      email: String(body.email).trim(),
      interest: String(body.interest).trim(),
    }

    await upsertBlogLead(submission)

    return NextResponse.json({
      ok: true,
      redirectUrl: '/thank-you/blog-signup',
    })
  } catch (error) {
    console.error('Blog lead API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit right now.' },
      { status: 500 }
    )
  }
}