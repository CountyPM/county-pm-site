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

async function upsertContact(payload: {
  name: string
  company: string
  role: string
  license: string
  email: string
  phone: string
  message: string
}) {
  const locationId = requiredEnv('GHL_LOCATION_ID')
  const token = requiredEnv('GHL_PRIVATE_TOKEN')

  const [firstName, ...rest] = payload.name.split(' ')
  const lastName = rest.join(' ')

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
      firstName: firstName || payload.name,
      lastName,
      email: payload.email,
      phone: payload.phone,
      companyName: payload.company,
      tags: ['professional_partner', payload.role],
      source: 'Website Professional Partners Form',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL contact upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  const contactId =
    data.contact?.id || data.contact?.contactId || data.id || data.contactId

  return { contactId, data }
}

async function updateCustomFieldsIfPossible(
  contactId: string | undefined,
  payload: {
    company: string
    role: string
    license: string
    message: string
  }
) {
  if (!contactId) {
    console.warn(
      'Professional partners: missing contactId from upsert response, skipping custom field update.'
    )
    return
  }

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
          key: 'partner_company',
          field_value: payload.company,
        },
        {
          key: 'partner_role',
          field_value: payload.role,
        },
        {
          key: 'partner_license',
          field_value: payload.license,
        },
        {
          key: 'partner_notes',
          field_value: payload.message,
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.warn(
      `Professional partners: custom field update skipped: ${response.status} ${JSON.stringify(
        data
      )}`
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const submission = {
      name: String(body.name || '').trim(),
      company: String(body.company || '').trim(),
      role: String(body.role || '').trim(),
      license: String(body.license || '').trim(),
      email: String(body.email || '').trim(),
      phone: String(body.phone || '').trim(),
      message: String(body.message || '').trim(),
    }

    if (
      !submission.name ||
      !submission.company ||
      !submission.role ||
      !submission.email ||
      !submission.phone ||
      !submission.message
    ) {
      return NextResponse.json(
        { error: 'Please complete all required fields.' },
        { status: 400 }
      )
    }

    const { contactId } = await upsertContact(submission)

    await updateCustomFieldsIfPossible(contactId, {
      company: submission.company,
      role: submission.role,
      license: submission.license,
      message: submission.message,
    })

    return NextResponse.json({
      ok: true,
      redirectUrl: '/thank-you/professional-partners',
    })
  } catch (error) {
    console.error('Professional partners form error:', error)

    return NextResponse.json(
      { error: 'Unable to submit form right now.' },
      { status: 500 }
    )
  }
}