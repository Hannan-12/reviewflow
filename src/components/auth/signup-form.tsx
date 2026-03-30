'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GoogleOAuthButton } from './google-oauth-button'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Mail, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'    }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500'  }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-yellow-500' }
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500'}
  return                     { score, label: 'Very strong', color: 'bg-emerald-600' }
}

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSentToEmail(data.email)
    setEmailSent(true)
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground text-sm mb-1">Confirmation link sent to</p>
        <p className="font-bold text-foreground mb-6">{sentToEmail}</p>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Click the link to activate your account and start your 14-day free trial.
        </p>
        <Button variant="outline" className="w-full h-11" onClick={() => router.push('/login')}>
          Back to sign in
        </Button>
      </div>
    )
  }

  const strength = password.length > 0 ? getStrength(password) : null

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground mb-1">Start your free trial</h1>
        <p className="text-muted-foreground text-sm">14 days free — no credit card required</p>
      </div>

      <GoogleOAuthButton label="Continue with Google" />

      <div className="flex items-center gap-3 my-5">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium">Full name</Label>
          <Input id="fullName" type="text" placeholder="Jane Smith" autoComplete="name" className="h-11" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" className="h-11" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="h-11 pr-10"
              {...register('password', {
                onChange: (e) => setPassword(e.target.value),
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {strength && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      i <= strength.score ? strength.color : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <p className={cn('text-xs font-medium', {
                'text-red-500':     strength.label === 'Weak',
                'text-amber-500':   strength.label === 'Fair',
                'text-yellow-500':  strength.label === 'Good',
                'text-emerald-500': strength.label === 'Strong' || strength.label === 'Very strong',
              })}>
                {strength.label} password
              </p>
            </div>
          )}

          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account — free trial'}
        </Button>
      </form>

      <div className="flex items-start gap-2 mt-4 p-3 bg-muted/50 rounded-xl">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
