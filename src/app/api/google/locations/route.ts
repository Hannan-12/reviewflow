import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken, listAccounts, listLocations } from '@/lib/google/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const token     = await getValidAccessToken(user.id)
    const accounts  = await listAccounts(token)

    // Fetch locations for all accounts in parallel
    const results = await Promise.all(
      accounts.map(async (account) => {
        const locations = await listLocations(account.name, token)
        return locations.map((loc) => ({ ...loc, accountName: account.name }))
      })
    )

    return NextResponse.json({ locations: results.flat() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('No Google account connected')) {
      return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }
    console.error('[google/locations]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
