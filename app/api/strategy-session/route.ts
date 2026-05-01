import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

type DecisionIntent = 'selling' | 'renting' | 'holding' | 'still-deciding'

type StrategySessionSubmission = {
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyAddress: string
  decisionIntent: DecisionIntent
  notes: string
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

function isDecisionIntent(value: string): value is DecisionIntent {
  return (
    value === 'selling' ||
    value === 'renting' ||
    value === 'holding' ||
    value === 'still-deciding'
  )
}

async function upsertContact(payload: StrategySessionSubmission) {
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
      tags: ['strategy_session', 'owner_lead', payload.decisionIntent],
      source: 'Website Strategy Session Form',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL contact upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  const contactId = extractContactId(data)

  if (!contactId) {
    throw new Error('GHL contact upsert succeeded but no contact ID was returned.')
  }

  return contactId
}

async function updateStrategySessionFields(
  contactId: string,
  payload: Pick<
    StrategySessionSubmission,
    'propertyAddress' | 'decisionIntent' | 'notes'
  >
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
          key: 'property_address',
          field_value: payload.propertyAddress,
        },
        {
          key: 'decision_intent',
          field_value: payload.decisionIntent,
        },
        {
          key: 'strategy_session_notes',
          field_value: payload.notes || '',
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `Strategy session field update failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'propertyAddress',
      'decisionIntent',
    ] as const

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const decisionIntent = String(body.decisionIntent).trim()

    if (!isDecisionIntent(decisionIntent)) {
      return NextResponse.json(
        { error: 'Invalid decision intent.' },
        { status: 400 }
      )
    }

    const submission: StrategySessionSubmission = {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      propertyAddress: String(body.propertyAddress).trim(),
      decisionIntent,
      notes: body.notes ? String(body.notes).trim() : '',
    }

    const contactId = await upsertContact(submission)

    await updateStrategySessionFields(contactId, {
      propertyAddress: submission.propertyAddress,
      decisionIntent: submission.decisionIntent,
      notes: submission.notes,
    })

    return NextResponse.json({
      ok: true,
      redirectUrl: requiredEnv('GHL_BOOKING_URL'),
    })
  } catch (error) {
    console.error('Strategy Session API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit form right now.' },
      { status: 500 }
    )
  }
}