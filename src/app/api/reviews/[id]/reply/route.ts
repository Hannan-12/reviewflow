import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { sendReplyConfirmationEmail } from '@/lib/resend/client';
import { getValidAccessToken, replyToReview } from '@/lib/google/api';

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

interface ReplyRequest {
  replyText: string;
  aiAccepted?: boolean;
}

// POST /api/reviews/[id]/reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: reviewId } = await params;
    const { replyText, aiAccepted } = (await request.json()) as ReplyRequest;

    if (!replyText || replyText.trim().length === 0) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const admin = getAdmin()

    // Fetch review — enforce ownership via user_id
    const { data: review, error: reviewError } = await admin
      .from('reviews')
      .select('*, profile:profiles(business_name), user:users(email, full_name)')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Save reply to DB
    const { error: updateError } = await admin
      .from('reviews')
      .update({
        reply: replyText,
        replied_at: new Date().toISOString(),
        user_accepted_ai: aiAccepted ?? false,
        reply_synced_to_gbp: false,
      })
      .eq('id', reviewId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
    }

    // Sync to Google Business Profile
    let syncedToGBP = false
    if (review.google_review_name) {
      try {
        const token = await getValidAccessToken(user.id)
        await replyToReview(review.google_review_name, replyText, token)
        await admin
          .from('reviews')
          .update({ reply_synced_to_gbp: true })
          .eq('id', reviewId)
        syncedToGBP = true
      } catch (gbpError) {
        console.error('[reply] GBP sync failed, reply saved locally:', gbpError)
      }
    }

    // Send confirmation email (non-blocking)
    try {
      const reviewUser = review.user as any
      const profile = review.profile as any
      await sendReplyConfirmationEmail(
        reviewUser.email,
        reviewUser.full_name || 'User',
        profile.business_name,
        review.reviewer_name || 'Customer'
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: syncedToGBP
        ? 'Reply posted to Google Business Profile'
        : 'Reply saved (will sync to Google when connection is refreshed)',
      syncedToGBP,
    });
  } catch (error) {
    console.error('Error saving reply:', error);
    return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
  }
}

// GET /api/reviews/[id]/reply
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: reviewId } = await params;
    const admin = getAdmin()

    const { data: review, error } = await admin
      .from('reviews')
      .select('reply, replied_at, user_accepted_ai, reply_synced_to_gbp')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (error || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      reply: review.reply,
      repliedAt: review.replied_at,
      userAcceptedAi: review.user_accepted_ai,
      syncedToGBP: review.reply_synced_to_gbp,
    });
  } catch (error) {
    console.error('Error fetching reply:', error);
    return NextResponse.json({ error: 'Failed to fetch reply' }, { status: 500 });
  }
}
