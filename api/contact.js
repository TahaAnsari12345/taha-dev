import nodemailer from 'nodemailer';
import { z } from 'zod';
import { applyCors, clientIp, createRateLimiter, originAllowed } from './_lib/http.js';

/**
 * POST /api/contact  (Vercel serverless function)
 *
 * Required env vars (never committed, never sent to the browser):
 *   CONTACT_TO_EMAIL  private inbox that receives messages
 *   SMTP_USER         Gmail address used to send
 *   SMTP_PASS         Gmail App Password
 * Optional:
 *   ALLOWED_ORIGINS   comma-separated extra origins allowed to call this endpoint
 *
 * The destination address is only ever read from the environment and is never logged or returned.
 */

// ---------- validation ----------
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(200).optional(), // honeypot
});

// ---------- sanitisation ----------
// Strip control chars (also blocks header injection via CR/LF) and HTML tags, collapse whitespace.
const clean = (s) =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
const oneLine = (s) => clean(s).replace(/\s+/g, ' ');
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- abuse limits ----------
const WINDOW_MS = 10 * 60 * 1000;
const limited = createRateLimiter({ windowMs: WINDOW_MS, max: 5 }); // per IP, per warm instance
const MAX_BODY_BYTES = 16 * 1024;

// ---------- email ----------
function renderHtml({ name, email, subject, message }) {
  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#0f172a;font-size:14px">${value}</td></tr>`;
  return `<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <tr><td style="background:linear-gradient(90deg,#2563eb,#8b5cf6);padding:20px 24px">
        <p style="margin:0;color:#e0e7ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Portfolio contact form</p>
        <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px">New message from ${escapeHtml(name)}</h1>
      </td></tr>
      <tr><td style="padding:20px 24px">
        <table role="presentation" cellpadding="0" cellspacing="0">
          ${row('Name', escapeHtml(name))}
          ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#2563eb">${escapeHtml(email)}</a>`)}
          ${row('Subject', escapeHtml(subject))}
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-left:3px solid #2563eb;border-radius:8px;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div>
        <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">Hit reply to respond directly to ${escapeHtml(name)}.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

const GENERIC_ERROR = { ok: false, message: 'Something went wrong. Please try again later.' };

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(originAllowed(req) ? 204 : 403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }
  if (!originAllowed(req)) return res.status(403).json({ ok: false, message: 'Request not allowed.' });

  if (limited(clientIp(req))) {
    res.setHeader('Retry-After', String(Math.ceil(WINDOW_MS / 1000)));
    return res.status(429).json({ ok: false, message: 'Too many requests. Please try again later.' });
  }

  if (Number(req.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, message: 'Please check your details and try again.' });
  }

  const parsed = schema.safeParse(req.body && typeof req.body === 'object' ? req.body : {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Please check your details and try again.' });
  }

  const { website, ...fields } = parsed.data;
  // Honeypot filled => a bot. Pretend success so it learns nothing.
  if (website && website.trim() !== '') return res.status(200).json({ ok: true });

  const data = {
    name: oneLine(fields.name),
    email: oneLine(fields.email),
    subject: oneLine(fields.subject),
    message: clean(fields.message),
  };
  // Re-check after sanitising (e.g. a message made only of tags would now be empty).
  if (data.name.length < 2 || data.subject.length < 3 || data.message.length < 10 || !z.string().email().safeParse(data.email).success) {
    return res.status(400).json({ ok: false, message: 'Please check your details and try again.' });
  }

  const { CONTACT_TO_EMAIL, SMTP_USER, SMTP_PASS } = process.env;
  if (!CONTACT_TO_EMAIL || !SMTP_USER || !SMTP_PASS) {
    console.error('contact: server is not configured');
    return res.status(500).json(GENERIC_ERROR);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') },
      // Keep failures well inside the function's maxDuration (vercel.json)
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });

    await transporter.sendMail({
      from: { name: 'Portfolio Contact', address: SMTP_USER },
      to: CONTACT_TO_EMAIL,
      replyTo: { name: data.name, address: data.email },
      subject: `Portfolio message: ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\nSubject: ${data.subject}\n\n${data.message}`,
      html: renderHtml(data),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Visitors only ever see the generic message. The server log gets a short, non-sensitive
    // diagnostic: error code + SMTP response code, never addresses, credentials or message text.
    console.error('contact: send failed', err?.code || 'unknown', err?.responseCode || '');
    return res.status(500).json(GENERIC_ERROR);
  }
}
