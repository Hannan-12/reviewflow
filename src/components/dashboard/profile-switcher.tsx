'use client'

import { Building2 } from 'lucide-react'

interface Profile {
  id: string
  business_name: string
}

interface ProfileSwitcherProps {
  profiles: Profile[]
  currentProfile: string | null
  allLabel: string
  onSelect: (profileId: string | null) => void
}

export function ProfileSwitcher({ profiles, currentProfile, allLabel, onSelect }: ProfileSwitcherProps) {
  if (profiles.length <= 1) return null

  return (
    <div className="bg-card border border-border rounded-2xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 flex-wrap">
      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            !currentProfile
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          }`}
        >
          {allLabel}
        </button>
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors max-w-28 sm:max-w-48 truncate ${
              currentProfile === p.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {p.business_name}
          </button>
        ))}
      </div>
    </div>
  )
}
