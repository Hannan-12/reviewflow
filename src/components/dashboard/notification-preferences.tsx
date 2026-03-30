import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface NotificationSettings {
  emailEnabled: boolean;
  emailOnAllReviews: boolean;
  emailMinRating: number | null;
  slackEnabled: boolean;
  slackWebhookUrl: string;
  slackOnAllReviews: boolean;
  slackMinRating: number | null;
  emailDigestFrequency: 'instant' | 'daily' | 'weekly';
}

interface NotificationPreferencesProps {
  profileId: string;
  onSaved?: () => void;
}

export function NotificationPreferences({
  profileId,
  onSaved,
}: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailOnAllReviews: true,
    emailMinRating: null,
    slackEnabled: false,
    slackWebhookUrl: '',
    slackOnAllReviews: true,
    slackMinRating: null,
    emailDigestFrequency: 'instant',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/notifications/preferences?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setSettings((prev) => ({
            ...prev,
            emailEnabled: data.email_enabled ?? data.emailEnabled ?? prev.emailEnabled,
            emailOnAllReviews: data.email_on_all_reviews ?? data.emailOnAllReviews ?? prev.emailOnAllReviews,
            emailMinRating: data.email_min_rating ?? data.emailMinRating ?? prev.emailMinRating,
            slackEnabled: data.slack_enabled ?? data.slackEnabled ?? prev.slackEnabled,
            slackWebhookUrl: data.slack_webhook_url ?? data.slackWebhookUrl ?? prev.slackWebhookUrl,
            slackOnAllReviews: data.slack_on_all_reviews ?? data.slackOnAllReviews ?? prev.slackOnAllReviews,
            slackMinRating: data.slack_min_rating ?? data.slackMinRating ?? prev.slackMinRating,
            emailDigestFrequency: data.email_digest_frequency ?? data.emailDigestFrequency ?? prev.emailDigestFrequency,
          }));
        }
      })
      .catch(() => {});
  }, [profileId]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          ...settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('Notification preferences saved');
      onSaved?.();
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSlackWebhookSave = async () => {
    if (!settings.slackWebhookUrl.trim()) {
      toast.error('Enter a valid Slack webhook URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notifications/slack-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          webhookUrl: settings.slackWebhookUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to configure Slack webhook');
      }

      toast.success('Slack webhook configured');
      onSaved?.();
    } catch (error) {
      toast.error('Failed to configure Slack webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Email Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={settings.emailEnabled}
              onChange={(e) =>
                setSettings({ ...settings, emailEnabled: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="emailEnabled" className="cursor-pointer">
              Enable email notifications
            </Label>
          </div>

          {settings.emailEnabled && (
            <>
              <div className="flex items-center gap-3 ml-6">
                <input
                  type="checkbox"
                  id="emailOnAll"
                  checked={settings.emailOnAllReviews}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailOnAllReviews: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="emailOnAll" className="cursor-pointer text-sm">
                  Notify for all reviews
                </Label>
              </div>

              {!settings.emailOnAllReviews && (
                <div className="ml-6">
                  <Label htmlFor="minRating" className="text-sm">
                    Only notify for reviews with rating ≤
                  </Label>
                  <select
                    id="minRating"
                    value={settings.emailMinRating || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailMinRating: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-1 p-2 border rounded w-20"
                  >
                    <option value="">Any</option>
                    <option value="1">1★</option>
                    <option value="2">2★</option>
                    <option value="3">3★</option>
                    <option value="4">4★</option>
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="frequency" className="text-sm">
                  Notification frequency
                </Label>
                <select
                  id="frequency"
                  value={settings.emailDigestFrequency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailDigestFrequency: e.target.value as
                        | 'instant'
                        | 'daily'
                        | 'weekly',
                    })
                  }
                  className="mt-1 p-2 border rounded w-full"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                </select>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Slack Notifications */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Slack Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="slackEnabled"
              checked={settings.slackEnabled}
              onChange={(e) =>
                setSettings({ ...settings, slackEnabled: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="slackEnabled" className="cursor-pointer">
              Enable Slack notifications
            </Label>
          </div>

          {settings.slackEnabled && (
            <>
              <div>
                <Label htmlFor="webhookUrl" className="text-sm">
                  Slack Webhook URL
                </Label>
                <Input
                  id="webhookUrl"
                  type="password"
                  value={settings.slackWebhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, slackWebhookUrl: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from Slack's Incoming Webhooks settings
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSlackWebhookSave}
                  disabled={loading}
                  size="sm"
                >
                  Save Webhook
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="slackOnAll"
                  checked={settings.slackOnAllReviews}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      slackOnAllReviews: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="slackOnAll" className="cursor-pointer text-sm">
                  Notify for all reviews
                </Label>
              </div>

              {!settings.slackOnAllReviews && (
                <div>
                  <Label htmlFor="slackMinRating" className="text-sm">
                    Only notify for reviews with rating ≤
                  </Label>
                  <select
                    id="slackMinRating"
                    value={settings.slackMinRating || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        slackMinRating: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-1 p-2 border rounded w-20"
                  >
                    <option value="">Any</option>
                    <option value="1">1★</option>
                    <option value="2">2★</option>
                    <option value="3">3★</option>
                    <option value="4">4★</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        Save All Preferences
      </Button>
    </div>
  );
}
