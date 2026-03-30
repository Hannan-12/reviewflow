'use client'

import { useState, useEffect, useRef } from 'react'
import { Tag, X, Plus, Check } from 'lucide-react'

interface ReviewTag {
  id: string
  name: string
  color: string
}

interface TagPickerProps {
  reviewId: string
}

export function TagPicker({ reviewId }: TagPickerProps) {
  const [allTags, setAllTags] = useState<ReviewTag[]>([])
  const [assigned, setAssigned] = useState<ReviewTag[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setAllTags).catch(() => {})
    fetch(`/api/reviews/tags?reviewId=${reviewId}`).then(r => r.json()).then(setAssigned).catch(() => {})
  }, [reviewId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isAssigned = (tagId: string) => assigned.some(t => t.id === tagId)

  const toggle = async (tag: ReviewTag) => {
    if (loading) return
    setLoading(true)
    if (isAssigned(tag.id)) {
      await fetch(`/api/reviews/tags?reviewId=${reviewId}&tagId=${tag.id}`, { method: 'DELETE' })
      setAssigned(prev => prev.filter(t => t.id !== tag.id))
    } else {
      await fetch('/api/reviews/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, tagId: tag.id }),
      })
      setAssigned(prev => [...prev, tag])
    }
    setLoading(false)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Assigned tags + open button */}
      <div className="flex items-center flex-wrap gap-1.5">
        {assigned.map(tag => (
          <span
            key={tag.id}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={(e) => { e.stopPropagation(); toggle(tag) }}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Tag className="w-3 h-3" />
          {assigned.length === 0 ? 'Add tag' : <Plus className="w-3 h-3" />}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[160px]">
          {allTags.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-1">Loading tags…</p>
          ) : (
            <div className="space-y-0.5">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggle(tag)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  {isAssigned(tag.id) && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
