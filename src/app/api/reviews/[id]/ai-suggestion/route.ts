export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { generateReplyFromAI } from '@/lib/openai/client';

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/reviews/[id]/ai-suggestion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reviewId } = await params;
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    const admin = getAdmin()

    // Get review details — verify it belongs to this user
    const { data: review, error: reviewError } = await admin
      .from('reviews')
      .select('*, profile:profiles(business_name)')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Get the business type from the profile
    const businessName = review.profile?.business_name || 'our business';
    const businessType = 'service';

    // Generate AI suggestion
    const suggestion = await generateReplyFromAI({
      reviewerName: review.reviewer_name || 'Valued Customer',
      rating: review.rating,
      comment: review.comment || '',
      businessName,
      businessType,
    });

    // Store the suggestion
    await admin
      .from('reviews')
      .update({ ai_suggested_reply: suggestion })
      .eq('id', reviewId)
      .eq('user_id', user.id);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
