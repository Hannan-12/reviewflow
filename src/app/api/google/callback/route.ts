import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens } from '@/lib/google/oauth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')  // user ID we passed as state
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard/profiles?error=google_denied`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    console.log('[google/callback] tokens received, access_token present:', !!tokens.access_token, 'refresh_token present:', !!tokens.refresh_token)

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const updatePayload: Record<string, string> = {
      google_access_token: tokens.access_token,
      google_token_expiry: expiry,
    }
    if (tokens.refresh_token) {
      updatePayload.google_refresh_token = tokens.refresh_token
    }

    const { error: updateError, count } = await admin
      .from('users')
      .update(updatePayload)
      .eq('id', state)

    console.log('[google/callback] update result — error:', updateError, 'count:', count)

    if (updateError) {
      console.error('[google/callback] supabase update failed:', updateError)
      return NextResponse.redirect(`${appUrl}/dashboard/profiles?error=google_failed`)
    }

    return NextResponse.redirect(`${appUrl}/dashboard/profiles?connected=true`)
  } catch (err) {
    console.error('[google/callback] error:', err)
    return NextResponse.redirect(`${appUrl}/dashboard/profiles?error=google_failed`)
  }
}
