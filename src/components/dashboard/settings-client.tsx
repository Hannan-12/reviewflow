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

interface SettingsClientProps {
  email: string
  fullName: string | null
  planName: string | null
  subscriptionStatus: string | null
}

export function SettingsClient({ email, fullName, planName, subscriptionStatus }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

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
    if (error) toast.error('Failed to update name')
    else toast.success('Name updated')
    setSavingName(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword) { toast.error('New password is required'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setDeleting(true)
    // Sign out — full account deletion requires a server-side admin call
    await supabase.auth.signOut()
    toast.success('Account signed out. Contact support to fully delete your account.')
    router.push('/login')
  }

  const planLabel = planName
    ? planName.charAt(0).toUpperCase() + planName.slice(1)
    : 'Free'
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Account Info */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Account Information</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email address</Label>
            <Input id="email" value={email} disabled className="bg-muted text-muted-foreground text-sm h-9" />
            <p className="text-[11px] text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">Full name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="text-sm h-9 flex-1"
              />
              <Button size="sm" onClick={handleSaveName} disabled={savingName} className="h-9 font-semibold">
                {savingName ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Password */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Change Password</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-medium">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="text-sm h-9"
            />
          </div>
          <Button size="sm" onClick={handleChangePassword} disabled={savingPassword} className="font-semibold">
            {savingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </section>

      {/* Plan & Billing */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Plan & Billing</h2>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              {planLabel} Plan
              {isActive && (
                <span className="ml-2 text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                  {subscriptionStatus === 'trialing' ? 'Trial' : 'Active'}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {subscriptionStatus === 'trialing'
                ? 'You are currently on a free trial.'
                : isActive
                ? 'Your subscription is active.'
                : 'No active subscription.'}
            </p>
          </div>
          <Link href="/billing">
            <Button size="sm" variant="outline" className="font-semibold text-xs h-8">
              Manage plan
            </Button>
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-card border border-destructive/30 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-destructive/30 flex items-center gap-2.5">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            To delete your account, type <span className="font-mono font-bold">DELETE</span> below and confirm.
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="text-sm h-9 flex-1 font-mono"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== 'DELETE'}
              className="h-9 font-semibold"
            >
              {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
