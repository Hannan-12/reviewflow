import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_TAGS = [
  { name: 'Positive',   color: '#22c55e' },
  { name: 'Negative',   color: '#ef4444' },
  { name: 'Complaint',  color: '#f97316' },
  { name: 'Praise',     color: '#3b82f6' },
  { name: 'Pricing',    color: '#8b5cf6' },
  { name: 'Service',    color: '#06b6d4' },
]

// GET /api/tags — list all tags for the user (seeds defaults on first call)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tags } = await supabase
    .from('review_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Seed defaults if user has no tags yet
  if (!tags?.length) {
    await supabase.from('review_tags').insert(
      DEFAULT_TAGS.map((t) => ({ ...t, user_id: user.id }))
    )
    const { data: seeded } = await supabase
      .from('review_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    return NextResponse.json(seeded ?? [])
  }

  return NextResponse.json(tags)
}

// POST /api/tags — create a new tag
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('review_tags')
    .insert({ user_id: user.id, name: name.trim(), color: color ?? '#6366f1' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/tags?id=xxx
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('review_tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
