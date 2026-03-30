import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateReplyFromAI } from '@/lib/openai/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/reviews/[id]/ai-suggestion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Get review details
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, profile:profiles(business_name, business_type)')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Get the business type from the profile
    const businessName = review.profile?.business_name || 'our business';
    const businessType = (review.profile as any)?.business_type || 'service';

    // Generate AI suggestion
    const suggestion = await generateReplyFromAI({
      reviewerName: review.reviewer_name || 'Valued Customer',
      rating: review.rating,
      comment: review.comment || '',
      businessName,
      businessType,
    });

    // Store the suggestion
    await supabase
      .from('reviews')
      .update({ ai_suggested_reply: suggestion })
      .eq('id', reviewId);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
