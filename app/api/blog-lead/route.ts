import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

type BlogLeadSubmission = {
  firstName: string
  email: string
  interest: string
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function extractContactId(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const record = data as Record<string, unknown>

  if (record.contact && typeof record.contact === 'object') {
    const contact = record.contact as Record<string, unknown>

    if (typeof contact.id === 'string' && contact.id.trim() !== '') {
      return contact.id
    }
  }

  if (typeof record.id === 'string' && record.id.trim() !== '') {
    return record.id
  }

  return null
}

async function upsertBlogLead(payload: BlogLeadSubmission) {
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

  if (!response.ok) {
    throw new Error(
      `GHL blog lead upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  const contactId = extractContactId(data)

  if (!contactId) {
    throw new Error('GHL blog lead upsert succeeded but no contact ID was returned.')
  }

  return contactId
}

async function updateBlogLeadFields(
  contactId: string,
  payload: Pick<BlogLeadSubmission, 'interest'>
) {
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

  const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customFields: [
        {
          key: 'blog_interest',
          field_value: payload.interest,
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL blog lead field update failed: ${response.status} ${JSON.stringify(data)}`
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

    const submission: BlogLeadSubmission = {
      firstName: String(body.firstName).trim(),
      email: String(body.email).trim(),
      interest: String(body.interest).trim(),
    }

    const contactId = await upsertBlogLead(submission)

    await updateBlogLeadFields(contactId, {
      interest: submission.interest,
    })

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