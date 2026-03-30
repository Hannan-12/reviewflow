import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET /api/profiles — list user's profiles
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ profiles: profiles ?? [] })
}

// POST /api/profiles — add a new profile
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { location_name, account_id, business_name, address, phone, website } = body

  if (!location_name || !business_name) {
    return NextResponse.json({ error: 'location_name and business_name are required' }, { status: 400 })
  }

  // Check plan profile limit
  const { data: userData } = await supabase
    .from('users')
    .select('profile_limit')
    .eq('id', user.id)
    .single()

  const limit = userData?.profile_limit ?? 0
  if (limit === 0) {
    return NextResponse.json({ error: 'Please subscribe to a plan to add profiles.' }, { status: 403 })
  }

  if (limit !== -1) {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: `Your plan allows up to ${limit} profile${limit !== 1 ? 's' : ''}. Upgrade to add more.` }, { status: 403 })
    }
  }

  const admin = getAdmin()
  const { data: profile, error } = await admin
    .from('profiles')
    .insert({
      user_id: user.id,
      location_name,
      account_id,
      business_name,
      address:  address ?? null,
      phone:    phone   ?? null,
      website:  website ?? null,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This profile is already added.' }, { status: 409 })
    }
    console.error('[profiles POST]', error)
    return NextResponse.json({ error: 'Failed to add profile' }, { status: 500 })
  }

  return NextResponse.json({ profile }, { status: 201 })
}
