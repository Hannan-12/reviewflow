export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notifications/slack-webhook
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId, webhookUrl } = (await request.json()) as {
      profileId: string;
      webhookUrl: string;
    };

    if (!profileId || !webhookUrl) {
      return NextResponse.json(
        { error: 'profileId and webhookUrl are required' },
        { status: 400 }
      );
    }

    // Verify user owns this profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update profile with slack webhook URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ slack_webhook_url: webhookUrl })
      .eq('id', profileId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save webhook URL' }, { status: 500 });
    }

    // Upsert notification preferences
    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .single();

    if (existing) {
      await supabase
        .from('notification_preferences')
        .update({ slack_enabled: true, slack_webhook_url: webhookUrl })
        .eq('user_id', user.id)
        .eq('profile_id', profileId);
    } else {
      await supabase.from('notification_preferences').insert({
        user_id: user.id,
        profile_id: profileId,
        slack_enabled: true,
        slack_webhook_url: webhookUrl,
      });
    }

    return NextResponse.json({ success: true, message: 'Slack webhook configured' });
  } catch (error) {
    console.error('Error configuring Slack webhook:', error);
    return NextResponse.json({ error: 'Failed to configure webhook' }, { status: 500 });
  }
}
