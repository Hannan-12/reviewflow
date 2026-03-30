# Milestone 3 Installation & Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install the new packages needed for Milestone 3:
- `resend` - Email notifications
- `@anthropic-ai/sdk` - AI-powered reply suggestions with Claude
- `axios` - HTTP client for Slack webhooks

### 2. Run Database Migration

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Create new query
3. Copy and paste content of `supabase/milestone3_migration.sql`
4. Click "Run"

This creates the following tables and columns:
- `notification_preferences` - User notification settings
- `notification_log` - Audit trail of sent notifications
- Updates to `reviews` table - reply tracking, AI fields
- Updates to `profiles` table - Slack webhook, notification toggle

### 3. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add:
RESEND_API_KEY=re_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

**Required Services:**
- **Resend** (for email): Sign up at https://resend.com, create API key
- **Anthropic Claude** (for AI): Get API key from https://console.anthropic.com/account/keys

### 4. Start Development Server

```bash
npm run dev
# Runs on http://localhost:3000
```

### 5. Test Each Feature

#### Email Notifications
1. Go to Dashboard > Reviews
2. Add a new profile and sync reviews (or create a test review in DB)
3. Check email for notification alert

#### AI Reply Suggestions
1. Open any review in Dashboard > Reviews
2. Click "Reply to Review" button
3. Click "✨ Get AI Suggestion"
4. Verify AI generates contextual reply

#### Manual Replies
1. In review detail, write custom reply text
2. Click "Post Reply"
3. Verify reply is saved

#### Slack Integration
1. Create Slack App with Incoming Webhooks
2. Open review detail > click notification bell
3. Enable Slack, paste webhook URL
4. Save
5. Trigger new review sync to test notification

#### Notification Preferences
1. Open any review detail
2. Click notification bell icon
3. Configure email/Slack preferences
4. Save preferences

## File Structure

### New Files Created

**Database:**
- `supabase/milestone3_migration.sql` - Database schema updates

**Backend Services:**
- `src/lib/resend/client.ts` - Email sending via Resend
- `src/lib/claude/client.ts` - AI reply suggestions via Anthropic Claude
- `src/lib/slack/client.ts` - Slack webhook notifications
- `src/lib/notifications/service.ts` - Main notification orchestration

**API Endpoints:**
- `src/app/api/reviews/[id]/reply/route.ts` - POST/GET review replies
- `src/app/api/reviews/[id]/ai-suggestion/route.ts` - GET AI suggestions
- `src/app/api/notifications/preferences/route.ts` - Manage notification settings
- `src/app/api/notifications/slack-webhook/route.ts` - Configure Slack webhook

**UI Components:**
- `src/components/dashboard/reply-panel.tsx` - Reply composer with AI
- `src/components/dashboard/notification-preferences.tsx` - Settings panel
- `src/components/dashboard/review-detail-modal.tsx` - Review detail modal
- `src/components/dashboard/reviews-page-client.tsx` - Client wrapper for modals

**Documentation:**
- `MILESTONE3.md` - Complete feature documentation
- `.env.example` - Updated with new environment variables

### Updated Files

- `package.json` - Added dependencies
- `src/app/api/sync/route.ts` - Integrated notification triggers
- `src/components/dashboard/reviews-table.tsx` - Added reply button

## Troubleshooting

### Build/Type Errors
```bash
npm run build
# If errors, clear cache:
rm -rf .next
npm run build
```

### Runtime Errors
1. Check all environment variables are set in `.env.local`
2. Verify database migration ran successfully
3. Check browser console for client-side errors
4. Check terminal for server-side errors

### Email Not Sending
- Verify `RESEND_API_KEY` is correct and active
- Check `RESEND_FROM_EMAIL` is verified in Resend dashboard

### AI Suggestions Failing
- Verify `ANTHROPIC_API_KEY` has available quota
- Check Anthropic API status at https://status.anthropic.com
- Model may change - update in `src/lib/claude/client.ts` if needed

### Slack Notifications Not Working
- Verify webhook URL format is correct
- Check webhook hasn't expired (expires after 30 days)
- Verify profile has `notifications_enabled = true`

## Next Steps

After setup, you can:
1. Configure notification preferences per profile
2. Test reply suggestions on sample reviews
3. Connect Slack for team notifications
4. Monitor `notification_log` table for delivery status

## Advanced: Custom AI Model

To use different AI model, edit `src/lib/claude/client.ts`:

```typescript
// Current: Claude 3.5 Sonnet
const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Change this
  max_tokens: 200,
  // ...
});

// Alternative models:
// 'claude-3-opus-20250219' - Most capable
// 'claude-3-5-sonnet-20241022' - Balanced (current)
// 'claude-3-haiku-20240307' - Fastest
```

## Support

For issues, check:
- `MILESTONE3.md` - Feature documentation
- `src/lib/notifications/service.ts` - Notification flow
- `src/lib/claude/client.ts` - Claude API integration
- Supabase logs - Database issues
- API response in browser DevTools
