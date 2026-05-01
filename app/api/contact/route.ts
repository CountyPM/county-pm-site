import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

type ContactSubmission = {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
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

async function upsertContact(payload: ContactSubmission) {
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
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      tags: ['contact_form'],
      source: 'Website Contact Form',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL contact form upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  const contactId = extractContactId(data)

  if (!contactId) {
    throw new Error('GHL contact upsert succeeded but no contact ID was returned.')
  }

  return contactId
}

async function updateContactMessageField(contactId: string, message: string) {
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
          key: 'contact_form_message',
          field_value: message,
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL contact message field update failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = ['firstName', 'lastName', 'email', 'message'] as const

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const submission: ContactSubmission = {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      phone: body.phone ? String(body.phone).trim() : '',
      message: String(body.message).trim(),
    }

    const contactId = await upsertContact(submission)
    await updateContactMessageField(contactId, submission.message)

    return NextResponse.json({
      ok: true,
      redirectUrl: '/thank-you/contact',
    })
  } catch (error) {
    console.error('Contact form API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit contact form right now.' },
      { status: 500 }
    )
  }
}