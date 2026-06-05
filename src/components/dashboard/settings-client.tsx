'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Lock, CreditCard, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDashboardLang } from './lang-context'

interface SettingsClientProps {
  email: string
  fullName: string | null
  planName: string | null
  subscriptionStatus: string | null
  isGoogleUser: boolean
}

export function SettingsClient({ email, fullName, planName, subscriptionStatus, isGoogleUser }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useDashboardLang()

  // Account info
  const [name, setName] = useState(fullName ?? '')
  const [savingName, setSavingName] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleSaveName = async () => {
    setSavingName(true)
    const { error } = await supabase
      .from('users')
      .update({ full_name: name.trim() || null })
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    if (error) toast.error(t.set_name_failed)
    else toast.success(t.set_name_updated)
    setSavingName(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword) { toast.error(t.set_pw_required); return }
    if (newPassword.length < 8) { toast.error(t.set_pw_too_short); return }
    if (newPassword !== confirmPassword) { toast.error(t.set_pw_mismatch); return }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success(t.set_pw_updated)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error(t.set_delete_confirm_hint); return }
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? t.set_name_failed)
        setDeleting(false)
        return
      }
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error(t.set_name_failed)
      setDeleting(false)
    }
  }

  const planLabel = planName
    ? planName.charAt(0).toUpperCase() + planName.slice(1)
    : t.set_free_plan
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Account Info */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t.set_account_title}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">{t.set_email_label}</Label>
            <Input id="email" value={email} disabled className="bg-muted text-muted-foreground text-sm h-9" />
            <p className="text-[11px] text-muted-foreground">{t.set_email_hint}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">{t.set_name_label}</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.set_name_placeholder}
                className="text-sm h-9 flex-1"
              />
              <Button size="sm" onClick={handleSaveName} disabled={savingName} className="h-9 font-semibold">
                {savingName ? t.set_saving : t.set_save}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Password — hidden for Google OAuth users */}
      {!isGoogleUser && <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t.set_password_title}</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium">{t.set_new_password}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.set_min_chars}
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium">{t.set_confirm_password}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.set_repeat_password}
              className="text-sm h-9"
            />
          </div>
          <Button size="sm" onClick={handleChangePassword} disabled={savingPassword} className="font-semibold">
            {savingPassword ? t.set_updating : t.set_update_password}
          </Button>
        </div>
      </section>}

      {/* Plan & Billing */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t.set_plan_title}</h2>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              {planLabel} {t.set_plan_suffix}
              {isActive && (
                <span className="ml-2 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                  {subscriptionStatus === 'trialing' ? t.set_trial_badge : t.set_active_badge}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {subscriptionStatus === 'trialing'
                ? t.set_on_trial
                : isActive
                ? t.set_sub_active
                : t.set_no_sub}
            </p>
          </div>
          <Link href="/billing">
            <Button size="sm" variant="outline" className="font-semibold text-xs h-8">
              {t.set_manage_plan}
            </Button>
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-card border border-destructive/30 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-destructive/30 flex items-center gap-2.5">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">{t.set_danger_title}</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            {t.set_danger_desc} <span className="font-mono font-bold">DELETE</span> {t.set_danger_desc2}
          </p>
          <div className="flex gap-2">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={t.set_type_delete}
              className="text-sm h-9 flex-1 font-mono"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== 'DELETE'}
              className="h-9 font-semibold"
            >
              {deleting ? t.set_deleting : t.set_delete_account}
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
