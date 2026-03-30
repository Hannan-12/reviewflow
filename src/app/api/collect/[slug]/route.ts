import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Public: get link data + increment click count
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const admin = getAdmin()

  const { data: link } = await admin
    .from('review_collection_links')
    .select('*, profiles(business_name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment click count (fire and forget)
  admin
    .from('review_collection_links')
    .update({ click_count: (link.click_count ?? 0) + 1 })
    .eq('id', link.id)
    .then(() => {})

  return NextResponse.json(link)
}
