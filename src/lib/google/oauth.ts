const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export const GBP_SCOPE = 'https://www.googleapis.com/auth/business.manage'

export function getGoogleCallbackUrl() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
}

/** Build the URL to redirect the user to for Google Business OAuth */
export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    redirect_uri:  getGoogleCallbackUrl(),
    response_type: 'code',
    scope:         GBP_SCOPE,
    access_type:   'offline',
    prompt:        'consent',   // force consent so we always get refresh_token
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/** Exchange auth code for access + refresh tokens */
export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  getGoogleCallbackUrl(),
      grant_type:    'authorization_code',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
  }>
}

/** Refresh an expired access token */
export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type:    'refresh_token',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token refresh failed: ${err}`)
  }
  return res.json() as Promise<{
    access_token: string
    expires_in: number
  }>
}
