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

// STEP 1: UPSERT CONTACT
async function upsertContact(payload: {
  name: string
  email: string
  phone: string
}) {
  const locationId = requiredEnv('GHL_LOCATION_ID')
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

  const [firstName, ...rest] = payload.name.split(' ')
  const lastName = rest.join(' ') || 'Unknown'

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
      firstName,
      lastName,
      email: payload.email,
      phone: payload.phone,
      tags: ['rent_vs_buy_calculator'],
      source: 'Rent vs Buy Calculator',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data.contact?.id
}

// STEP 2: UPDATE CUSTOM FIELDS
async function updateCustomFields(contactId: string, fields: {
  timeline: string
  interest: string
}) {
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

  const response = await fetch(
    `${GHL_BASE_URL}/contacts/${contactId}`,
    {
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
            key: 'rent_vs_buy_timeline',
            field_value: fields.timeline,
          },
          {
            key: 'rent_vs_buy_interest',
            field_value: fields.interest,
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      `Custom field update failed: ${response.status} ${JSON.stringify(data)}`
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const timeline = String(body.timeline || '').trim()
    const interest = String(body.interest || '').trim()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const contactId = await upsertContact({
      name,
      email,
      phone,
    })

    if (contactId) {
      await updateCustomFields(contactId, {
        timeline,
        interest,
      })
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to submit form right now.' },
      { status: 500 }
    )
  }
}