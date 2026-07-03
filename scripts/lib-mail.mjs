// lib-mail.mjs — tiny SMTP sender for pipeline signals (heartbeat, alerts).
//
// Reuses the SAME Gmail account + App Password the blog-inbox harvester already
// uses (.env.blog-inbox). The App Password authenticates SMTP as well as IMAP,
// so no new credential is needed. Sends over smtp.gmail.com:465 (implicit TLS).
//
// Config (env var wins over .env.blog-inbox):
//   CPM_IMAP_USER   — the Gmail address (also the SMTP login + From)
//   CPM_IMAP_PASS   — the Gmail App Password
//   CPM_SMTP_HOST   — default smtp.gmail.com
//   CPM_SMTP_PORT   — default 465
//   CPM_HEARTBEAT_TO — where signals go; default cpmblog93012@gmail.com (the
//                      blog inbox the owner already watches — item #2 channel)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const cfg = {}
  const envPath = path.join(REPO_ROOT, '.env.blog-inbox')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq === -1) continue
      const key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      cfg[key] = val
    }
  }
  const get = (k, d) => process.env[k] ?? cfg[k] ?? d
  return {
    host: get('CPM_SMTP_HOST', 'smtp.gmail.com'),
    port: Number(get('CPM_SMTP_PORT', '465')),
    user: get('CPM_IMAP_USER'),
    pass: get('CPM_IMAP_PASS'),
    to: get('CPM_HEARTBEAT_TO', 'cpmblog93012@gmail.com'),
  }
}

export async function sendSignal({ subject, text, to }) {
  const cfg = loadEnv()
  if (!cfg.user || !cfg.pass) {
    throw new Error('No SMTP credentials (CPM_IMAP_USER / CPM_IMAP_PASS) in env or .env.blog-inbox')
  }
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  })
  const recipient = to || cfg.to
  const info = await transport.sendMail({
    from: `CPM Pipeline <${cfg.user}>`,
    to: recipient,
    subject,
    text,
  })
  return { messageId: info.messageId, accepted: info.accepted, to: recipient }
}
