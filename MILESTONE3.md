# Milestone 3: Notifications, Replies & AI Suggestions

Milestone 3 adds intelligent notifications, AI-powered review replies, and Slack integration to ReviewFlow.

## Features

### 1. Email Notifications (Resend)
Send instant email alerts when new reviews are synced to your profiles.

**Features:**
- Email notifications for new reviews
- Per-profile notification rules (only notify for low-rated reviews, daily digest, etc.)
- Filter by minimum rating
- Support for different notification frequencies (instant, daily, weekly)

**Setup:**
1. Sign up at [Resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@reviewflow.app
   ```

### 2. AI-Powered Review Replies
Generate intelligent responses to reviews using Claude AI.

**Features:**
- Click "✨ Get AI Suggestion" on any review
- AI generates contextual, professional replies
- Review and edit suggestions before posting
- Track which replies were AI-generated
- Replies sync back to Google Business Profile (coming soon)

**Setup:**
1. Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-xxxxx
   ```

### 3. Review Replies
Respond to customer reviews directly from the ReviewFlow dashboard.

**How to use:**
1. Go to Dashboard > Reviews
2. Click on a review card > "Reply to Review" button
3. Write your response or use AI suggestion
4. Click "Post Reply" to save

**Features:**
- Manual reply writing
- AI suggestion assistance
- Track reply status
- View reply history

### 4. Slack Integration
Get instant Slack notifications for new reviews.

**Features:**
- Send review alerts to Slack channels
- Per-profile Slack webhook configuration
- Filter alerts by minimum rating
- Interactive buttons to reply directly

**Setup per profile:**
1. Create a Slack App or use existing one
2. Add Incoming Webhooks integration
3. Get webhook URL (format: `https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN`)
4. Go to Dashboard > Reviews > select a review
5. Click the notification bell icon
6. Under "Slack Notifications", enable and paste webhook URL
7. Click "Save Webhook"

### 5. Notification Preferences
Configure how and when you want to be notified.

**Options:**
- **Email Notifications:**
  - Enable/disable email alerts
  - Notify for all reviews or only low-rated ones
  - Set minimum rating threshold
  - Choose frequency (instant, daily digest, weekly digest)

- **Slack Notifications:**
  - Enable/disable Slack alerts
  - Provide webhook URL
  - Notify for all reviews or only low-rated ones
  - Set minimum rating threshold

**How to access:**
1. Open any review in the Reviews page
2. Click the notification bell icon
3. Configure your preferences
4. Click "Save All Preferences"

## Database Schema

### New Tables

#### `notification_preferences`
Stores user notification settings per profile.

```sql
- user_id: User who owns this preference
- profile_id: Profile this preference applies to
- email_enabled: Enable email notifications
- email_on_all_reviews: Notify for all or only filtered reviews
- email_min_rating: Minimum rating to notify (lower = more alerts)
- slack_enabled: Enable Slack notifications
- slack_webhook_url: Slack incoming webhook URL
- slack_on_all_reviews: Notify for all or only filtered reviews
- slack_min_rating: Minimum rating threshold
- email_digest_frequency: 'instant' | 'daily' | 'weekly'
```

#### `notification_log`
Audit trail of all notifications sent.

```sql
- user_id: User notified
- profile_id: Profile of the review
- review_id: Review that triggered the notification
- notification_type: 'email' | 'slack'
- recipient: Email address or Slack channel ID
- status: 'pending' | 'sent' | 'failed' | 'bounced'
- sent_at: When the notification was sent
- attempts: Number of send attempts
- last_attempt_at: Last attempt timestamp
```

### Updated Tables

#### `reviews`
New fields added:
- `reply_text`: User's reply content
- `reply_sent_at`: When reply was posted
- `reply_synced_to_gbp`: Whether reply was synced to Google
- `ai_suggested_reply`: The AI-generated suggestion shown
- `user_accepted_ai`: Whether user accepted the AI suggestion
- `notified_at`: When user was notified about this review
- `notification_sent_to`: Array of notification types sent ('email', 'slack')
- `flagged_by_user`: Whether user flagged this review
- `flag_reason`: Reason for flagging

#### `profiles`
New fields added:
- `slack_webhook_url`: Slack webhook for this profile
- `notifications_enabled`: Master toggle for all notifications

## API Endpoints

### Notifications

**GET /api/notifications/preferences?profileId={id}**
- Get notification preferences for a profile
- Returns defaults if none exist

**POST /api/notifications/preferences**
- Save notification preferences
- Body: { profileId, emailEnabled, slackEnabled, ... }

**POST /api/notifications/slack-webhook**
- Configure Slack webhook for a profile
- Body: { profileId, webhookUrl }

### Reviews & Replies

**POST /api/reviews/[id]/reply**
- Submit a reply to a review
- Body: { replyText, aiAccepted }
- Returns: success confirmation

**GET /api/reviews/[id]/reply**
- Get existing reply for a review
- Returns: { reply, repliedAt, userAcceptedAi }

**GET /api/reviews/[id]/ai-suggestion?profileId={id}**
- Generate AI suggestion for a review
- Returns: { suggestion }

## UI Components

### `ReplyPanel`
Component for replying to reviews with AI assistance.

```tsx
<ReplyPanel
  reviewId={review.id}
  profileId={profile.id}
  reviewerName={review.reviewer_name}
  rating={review.rating}
  comment={review.comment}
  onReplySubmitted={() => ... }
/>
```

### `NotificationPreferences`
Component for managing notification settings.

```tsx
<NotificationPreferences
  profileId={profile.id}
  onSaved={() => ... }
/>
```

### `ReviewDetailModal`
Modal showing full review details with reply panel.

```tsx
<ReviewDetailModal
  review={selectedReview}
  isOpen={isOpen}
  onClose={() => ... }
/>
```

## Setup Instructions

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor, run:
-- supabase/milestone3_migration.sql
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

```bash
# Copy example to local env
cp .env.example .env.local

# Edit .env.local with your keys:
RESEND_API_KEY=re_xxxxx
OPENAI_API_KEY=sk-xxxxx
# etc.
```

### 4. Start Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Test Features

1. **Email notifications:** Trigger a review sync and check for email
2. **AI suggestions:** Open a review → click "✨ Get AI Suggestion"
3. **Slack:** Configure webhook → wait for next review notification
4. **Preferences:** Open any review → click bell icon to configure

## Services

### Notification Service (`src/lib/notifications/service.ts`)
Main service that handles sending notifications when reviews are synced.

```ts
await notifyNewReview(
  reviewId,
  profileId,
  userId,
  { reviewerName, rating, comment, review_date, reviewer_photo_url }
)
```

### Resend Email (`src/lib/resend/client.ts`)
Email integration for new review alerts and reply confirmations.

### OpenAI (`src/lib/openai/client.ts`)
Claude AI integration for generating reply suggestions.

### Slack (`src/lib/slack/client.ts`)
Slack integration for posting formatted notifications.

## Troubleshooting

### Emails not sending
- Check Resend API key is correct
- Check `RESEND_FROM_EMAIL` matches verified domain
- Check notification logs in Supabase for errors

### AI suggestions failing
- Verify OpenAI API key is correct
- Check API quota hasn't been exceeded
- Check Claude model name in `openai/client.ts`

### Slack notifications not appearing
- Verify webhook URL is correct and not expired
- Check profile has `notifications_enabled = true`
- Verify Slack workspace hasn't revoked webhook

### Replies not syncing
- Google Business Profile sync is planned for future release
- Currently replies are stored locally only

## Future Enhancements

- [ ] Sync replies back to Google Business Profile
- [ ] Bulk actions (reply to multiple reviews at once)
- [ ] Reply templates library
- [ ] Schedule replies to send later
- [ ] Team comment threads on reviews
- [ ] Auto-reply rules and triggers
- [ ] Sentiment analysis for flagging negative reviews
- [ ] Response rate analytics and insights
