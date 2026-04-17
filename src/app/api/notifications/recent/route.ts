export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  const { data, error } = await admin
    .from('notification_log')
    .select(`
      id,
      notification_type,
      status,
      sent_at,
      review_id,
      profile_id,
      reviews ( reviewer_name, rating, comment ),
      profiles ( business_name )
    `)
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })
    .limit(15)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Deduplicate: one entry per review (prefer email over slack)
  const seen = new Set<string>()
  const deduped = (data ?? []).filter((n) => {
    const key = n.review_id ?? n.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return NextResponse.json({ notifications: deduped.slice(0, 10) })
}
