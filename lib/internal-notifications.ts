type InternalNotificationType =
  | 'contact'
  | 'strategy-session'
  | 'blog-lead'
  | 'lead-magnet'
  | 'negative-review'

type SendInternalNotificationInput = {
  type: InternalNotificationType
  subject: string
  preheader?: string
  fields: Array<{ label: string; value: string }>
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildHtmlEmail({
  subject,
  preheader,
  fields,
}: Omit<SendInternalNotificationInput, 'type'>) {
  const rows = fields
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;vertical-align:top;width:180px;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;vertical-align:top;">
            ${escapeHtml(value)}
          </td>
        </tr>
      `
    )
    .join('')

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:24px;background:#f9fafb;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;background:#111827;color:#ffffff;">
            <div style="font-size:20px;font-weight:700;">${escapeHtml(subject)}</div>
            ${
              preheader
                ? `<div style="margin-top:8px;font-size:14px;color:#d1d5db;">${escapeHtml(preheader)}</div>`
                : ''
            }
          </div>

          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${rows}
            </table>
          </div>
        </div>
      </body>
    </html>
  `
}

function buildTextEmail({
  subject,
  preheader,
  fields,
}: Omit<SendInternalNotificationInput, 'type'>) {
  return [
    subject,
    preheader ?? '',
    '',
    ...fields.map(({ label, value }) => `${label}: ${value}`),
  ].join('\n')
}

export async function sendInternalNotification(
  input: SendInternalNotificationInput
) {
  const apiKey = requiredEnv('RESEND_API_KEY')
  const to = requiredEnv('INTERNAL_ALERT_EMAIL')
  const fromEmail = requiredEnv('INTERNAL_ALERT_FROM_EMAIL')
  const fromName = requiredEnv('INTERNAL_ALERT_FROM_NAME')

  const html = buildHtmlEmail(input)
  const text = buildTextEmail(input)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: input.subject,
      html,
      text,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `Internal notification failed: ${response.status} ${JSON.stringify(data)}`
    )
  }

  return data
}