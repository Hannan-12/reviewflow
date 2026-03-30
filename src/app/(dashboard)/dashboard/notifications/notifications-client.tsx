'use client'

import { useState } from 'react'
import { Bell, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NotificationPreferences } from '@/components/dashboard/notification-preferences'

interface Profile {
  id: string
  business_name: string
}

interface Props {
  profiles: Profile[]
}

export function NotificationsClient({ profiles }: Props) {
  const [selectedId, setSelectedId] = useState<string>(profiles[0]?.id ?? '')

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-bold text-base mb-1.5">No profiles yet</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          Add a Google Business Profile first to configure notification preferences.
        </p>
        <Link href="/dashboard/profiles">
          <Button size="sm" className="font-semibold text-xs">Add Profile</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-base">Notification Preferences</h2>
          <p className="text-xs text-muted-foreground">Configure email and Slack alerts per profile.</p>
        </div>
      </div>

      {/* Profile selector */}
      {profiles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedId === p.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.business_name}
            </button>
          ))}
        </div>
      )}

      {/* Preferences form */}
      {selectedId && (
        <NotificationPreferences key={selectedId} profileId={selectedId} />
      )}
    </div>
  )
}
