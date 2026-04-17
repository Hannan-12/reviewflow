import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, company, phone, locations, message } = await req.json()

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@reviewup.de',
      to: 'hello@reviewup.de',
      replyTo: email,
      subject: `Demo request from ${name} — ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #F5C518; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; color: #1A1A1A;">New Demo Request</h2>
          </div>
          <div style="padding: 24px; background: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: bold; color: #111;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; color: #111;"><a href="mailto:${email}" style="color: #F5C518;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0; color: #111;">${company}</td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0; color: #111;">${phone}</td></tr>` : ''}
              ${locations ? `<tr><td style="padding: 8px 0; color: #666;">Locations</td><td style="padding: 8px 0; color: #111;">${locations}</td></tr>` : ''}
              ${message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #111;">${message}</td></tr>` : ''}
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <a href="mailto:${email}" style="background: #F5C518; color: #1A1A1A; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply to ${name}</a>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Demo request error:', error)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}
