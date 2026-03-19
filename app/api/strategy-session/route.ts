import { NextRequest, NextResponse } from 'next/server'

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
    ]

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
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      propertyAddress: String(body.propertyAddress).trim(),
      decisionIntent: String(body.decisionIntent).trim(),
      notes: body.notes ? String(body.notes).trim() : '',
      submittedAt: new Date().toISOString(),
    }

    console.log('Strategy Session submission:', submission)

    return NextResponse.json({
      ok: true,
      redirectUrl: https://calendar.app.google/i5SWT8hspfcNYBna6,
    })
  } catch (error) {
    console.error('Strategy Session API error:', error)

    return NextResponse.json(
      { error: 'Unable to submit form right now.' },
      { status: 500 }
    )
  }
}