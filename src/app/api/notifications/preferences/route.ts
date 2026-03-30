import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface NotificationPrefs {
  profileId: string;
  emailEnabled?: boolean;
  emailOnAllReviews?: boolean;
  emailMinRating?: number | null;
  slackEnabled?: boolean;
  slackWebhookUrl?: string;
  slackOnAllReviews?: boolean;
  slackMinRating?: number | null;
  emailDigestFrequency?: 'instant' | 'daily' | 'weekly';
}

// GET /api/notifications/preferences?profileId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    if (!prefs) {
      return NextResponse.json({
        emailEnabled: true,
        emailOnAllReviews: true,
        slackEnabled: false,
        emailDigestFrequency: 'instant',
      });
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// POST /api/notifications/preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as NotificationPrefs;
    const { profileId, ...raw } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    // Convert camelCase body to snake_case DB columns
    const dbUpdates: Record<string, unknown> = {}
    if (raw.emailEnabled        !== undefined) dbUpdates.email_enabled         = raw.emailEnabled
    if (raw.emailOnAllReviews   !== undefined) dbUpdates.email_on_all_reviews  = raw.emailOnAllReviews
    if (raw.emailMinRating      !== undefined) dbUpdates.email_min_rating      = raw.emailMinRating
    if (raw.slackEnabled        !== undefined) dbUpdates.slack_enabled         = raw.slackEnabled
    if (raw.slackWebhookUrl     !== undefined) dbUpdates.slack_webhook_url     = raw.slackWebhookUrl
    if (raw.slackOnAllReviews   !== undefined) dbUpdates.slack_on_all_reviews  = raw.slackOnAllReviews
    if (raw.slackMinRating      !== undefined) dbUpdates.slack_min_rating      = raw.slackMinRating
    if (raw.emailDigestFrequency !== undefined) dbUpdates.email_digest_frequency = raw.emailDigestFrequency

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from('notification_preferences')
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('profile_id', profileId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id, profile_id: profileId, ...dbUpdates });

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
