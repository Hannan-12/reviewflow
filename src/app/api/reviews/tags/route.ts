import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reviews/tags?reviewId=xxx — get tags for a review
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reviewId = new URL(request.url).searchParams.get('reviewId')
  if (!reviewId) return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('review_tag_assignments')
    .select('tag_id, review_tags(id, name, color)')
    .eq('review_id', reviewId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tags = (data ?? []).map((row: any) => row.review_tags).filter(Boolean)
  return NextResponse.json(tags)
}

// POST /api/reviews/tags — assign a tag to a review
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reviewId, tagId } = await request.json()
  if (!reviewId || !tagId) return NextResponse.json({ error: 'reviewId and tagId are required' }, { status: 400 })

  // Verify user owns the review
  const { data: review } = await supabase
    .from('reviews').select('id').eq('id', reviewId).eq('user_id', user.id).single()
  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  const { error } = await supabase
    .from('review_tag_assignments')
    .upsert({ review_id: reviewId, tag_id: tagId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/reviews/tags?reviewId=xxx&tagId=xxx — remove a tag from a review
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const reviewId = searchParams.get('reviewId')
  const tagId = searchParams.get('tagId')
  if (!reviewId || !tagId) return NextResponse.json({ error: 'reviewId and tagId are required' }, { status: 400 })

  // Verify user owns the review
  const { data: review } = await supabase
    .from('reviews').select('id').eq('id', reviewId).eq('user_id', user.id).single()
  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  const { error } = await supabase
    .from('review_tag_assignments')
    .delete()
    .eq('review_id', reviewId)
    .eq('tag_id', tagId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
