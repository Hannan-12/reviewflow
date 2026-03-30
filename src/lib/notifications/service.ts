import { createClient } from '@supabase/supabase-js';
import { sendNewReviewEmail } from '@/lib/resend/client';
import { sendSlackNotification } from '@/lib/slack/client';
import { generateReplyFromAI } from '@/lib/openai/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function notifyNewReview(
  reviewId: string,
  profileId: string,
  userId: string,
  reviewData: {
    reviewerName: string | null;
    rating: number;
    comment: string | null;
    review_date: string;
    reviewer_photo_url: string | null;
  }
) {
  try {
    // Get user and profile info
    const [userRes, profileRes, prefsRes] = await Promise.all([
      supabase.from('users').select('email, full_name').eq('id', userId).single(),
      supabase
        .from('profiles')
        .select('business_name, slack_webhook_url, notifications_enabled')
        .eq('id', profileId)
        .single(),
      supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .single(),
    ]);

    if (userRes.error || profileRes.error) {
      throw new Error('Failed to fetch user or profile data');
    }

    const user = userRes.data;
    const profile = profileRes.data;
    const prefs = prefsRes.data;

    if (!profile.notifications_enabled) {
      console.log(`Notifications disabled for profile ${profileId}`);
      return;
    }

    // Check if notification should be sent based on preferences
    const shouldNotify =
      !prefs ||
      (prefs.email_enabled &&
        (prefs.email_on_all_reviews ||
          (prefs.email_min_rating && reviewData.rating <= prefs.email_min_rating)));

    if (!shouldNotify) {
      console.log(`Notification filtered out for review ${reviewId}`);
      return;
    }

    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reviews?profileId=${profileId}&reviewId=${reviewId}`;

    // Send email
    if (prefs?.email_enabled !== false) {
      try {
        await sendNewReviewEmail({
          userEmail: user.email,
          userName: user.full_name || 'User',
          profileName: profile.business_name,
          reviewerName: reviewData.reviewerName || 'Anonymous',
          rating: reviewData.rating,
          comment: reviewData.comment || '(No comment)',
          reviewDate: new Date(reviewData.review_date).toLocaleDateString(),
          profileId,
          reviewId,
        });

        // Log email notification
        await supabase.from('notification_log').insert({
          user_id: userId,
          profile_id: profileId,
          review_id: reviewId,
          notification_type: 'email',
          recipient: user.email,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        console.log(`Email sent for review ${reviewId}`);
      } catch (error) {
        console.error(`Error sending email for review ${reviewId}:`, error);

        // Log failed attempt
        await supabase.from('notification_log').insert({
          user_id: userId,
          profile_id: profileId,
          review_id: reviewId,
          notification_type: 'email',
          recipient: user.email,
          status: 'failed',
          error_message: String(error),
        });
      }
    }

    // Send Slack notification
    if (prefs?.slack_enabled && (profile.slack_webhook_url || prefs.slack_webhook_url)) {
      try {
        const webhookUrl = profile.slack_webhook_url || prefs.slack_webhook_url;

        if (!webhookUrl) {
          throw new Error('No Slack webhook URL configured');
        }

        // Generate AI suggestion to include inline in Slack
        let aiSuggestion: string | undefined
        if (reviewData.comment) {
          try {
            aiSuggestion = await generateReplyFromAI({
              reviewerName: reviewData.reviewerName || 'Anonymous',
              rating: reviewData.rating,
              comment: reviewData.comment,
              businessName: profile.business_name,
            })
          } catch {
            // Non-blocking — send Slack without suggestion if AI fails
          }
        }

        await sendSlackNotification(webhookUrl, {
          profileName: profile.business_name,
          reviewerName: reviewData.reviewerName || 'Anonymous',
          rating: reviewData.rating,
          comment: reviewData.comment || '(No comment)',
          reviewUrl,
          aiSuggestion,
        });

        // Log Slack notification
        await supabase.from('notification_log').insert({
          user_id: userId,
          profile_id: profileId,
          review_id: reviewId,
          notification_type: 'slack',
          recipient: 'slack',
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        console.log(`Slack notification sent for review ${reviewId}`);
      } catch (error) {
        console.error(`Error sending Slack notification for review ${reviewId}:`, error);

        await supabase.from('notification_log').insert({
          user_id: userId,
          profile_id: profileId,
          review_id: reviewId,
          notification_type: 'slack',
          recipient: 'slack',
          status: 'failed',
          error_message: String(error),
        });
      }
    }
  } catch (error) {
    console.error(`Error in notifyNewReview for review ${reviewId}:`, error);
    throw error;
  }
}
