export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure public.users row exists — the DB trigger can miss OAuth sign-ins
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
        const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

        const { data: existing } = await admin
          .from('users')
          .select('id, subscription_status, trial_ends_at')
          .eq('id', user.id)
          .single()

        if (!existing) {
          // Brand new user — create row with trial
          await admin.from('users').insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt,
          })
        } else if (existing.subscription_status !== 'active') {
          const noTrial = !existing.trial_ends_at
          const trialStillValid = existing.trial_ends_at && new Date(existing.trial_ends_at) > new Date()
          const statusWrong = existing.subscription_status !== 'trialing' && trialStillValid

          if (noTrial) {
            // User exists but never had a trial — grant one (edge case)
            await admin.from('users').update({
              subscription_status: 'trialing',
              trial_ends_at: trialEndsAt,
            }).eq('id', user.id)
          } else if (statusWrong) {
            // Trial date is valid but status is wrong — fix status only, never extend trial
            await admin.from('users').update({
              subscription_status: 'trialing',
            }).eq('id', user.id)
          }
          // If trial expired → do nothing; middleware redirects to /billing
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
