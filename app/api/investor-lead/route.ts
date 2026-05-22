// app/api/investor-lead/route.ts

import { NextRequest, NextResponse } from 'next/server'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

type InvestorInterest =
  | 'evaluating-management'
  | 'switching-manager'
  | 'buy-and-hold'
  | 'rent-vs-sell'
  | 'portfolio-growth'

type InvestorLeadSubmission = {
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyCity: string
  unitsOwned: string
  interest: InvestorInterest
}

const allowedInterests: InvestorInterest[] = [
  'evaluating-management',
  'switching-manager',
  'buy-and-hold',
  'rent-vs-sell',
  'portfolio-growth',
]

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

function normalizeSubmission(body: Record<string, unknown>): InvestorLeadSubmission {
  const interest = String(body.interest || '').trim() as InvestorInterest

  return {
    firstName: String(body.firstName || '').trim(),
    lastName: String(body.lastName || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    propertyCity: String(body.propertyCity || '').trim(),
    unitsOwned: String(body.unitsOwned || '').trim(),
    interest,
  }
}

function validateSubmission(submission: InvestorLeadSubmission): string | null {
  if (!submission.firstName) {
    return 'Missing required field: firstName'
  }

  if (!submission.lastName) {
    return 'Missing required field: lastName'
  }

  if (!submission.email) {
    return 'Missing required field: email'
  }

  if (!submission.interest) {
    return 'Missing required field: interest'
  }

  if (!allowedInterests.includes(submission.interest)) {
    return 'Invalid investor interest selected.'
  }

  return null
}

async function upsertInvestorLead(payload: InvestorLeadSubmission) {
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
      phone: payload.phone || undefined,

      // Keep investor funnel isolated.
      // Do not add blog_lead, lead_magnet, contact_form,
      // strategy_session, review_positive, or review_negative here.
      tags: ['investor_lead', payload.interest],

      source: 'Website Investor Insights Form',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL investor lead upsert failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  const contactId = extractContactId(data)

  if (!contactId) {
    throw new Error(
      'GHL investor lead upsert succeeded but no contact ID was returned.'
    )
  }

  return contactId
}

async function updateInvestorLeadFields(
  contactId: string,
  payload: Pick<
    InvestorLeadSubmission,
    'propertyCity' | 'unitsOwned' | 'interest'
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
          key: 'investor_interest',
          field_value: payload.interest,
        },
        {
          key: 'investor_property_city',
          field_value: payload.propertyCity,
        },
        {
          key: 'investor_units_owned',
          field_value: payload.unitsOwned,
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `GHL investor lead field update failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const submission = normalizeSubmission(body)
    const validationError = validateSubmission(submission)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const contactId = await upsertInvestorLead(submission)

    await updateInvestorLeadFields(contactId, {
      propertyCity: submission.propertyCity,
      unitsOwned: submission.unitsOwned,
      interest: submission.interest,
    })

    return NextResponse.json({
      ok: true,
      redirectUrl: '/thank-you/investor-insights',
    })
  } catch (error) {
    console.error('Investor lead API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit right now.' },
      { status: 500 }
    )
  }
}