'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Plus, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  content: string
}

interface TemplatePickerProps {
  onSelect: (content: string) => void
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = () =>
    fetch('/api/templates').then(r => r.json()).then(setTemplates).catch(() => {})

  useEffect(() => { load() }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSave = async () => {
    if (!newName.trim() || !newContent.trim()) return
    setSaving(true)
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, content: newContent }),
    })
    if (res.ok) {
      toast.success('Template saved')
      setNewName('')
      setNewContent('')
      setCreating(false)
      load()
    } else {
      toast.error('Failed to save template')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/templates?id=${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setCreating(false) }}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        Templates
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-2 z-50 bg-card border border-border rounded-xl shadow-lg w-72">
          {!creating ? (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold">Reply templates</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                  <button onClick={() => setOpen(false)}>
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground ml-2" />
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {templates.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No templates yet. Create one!
                  </p>
                ) : (
                  templates.map(t => (
                    <div
                      key={t.id}
                      className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer group"
                      onClick={() => { onSelect(t.content); setOpen(false) }}
                    >
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-0 group-hover:opacity-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{t.content}</p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(t.id, e)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">New template</p>
                <button onClick={() => setCreating(false)}>
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Template name"
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Reply content…"
                rows={4}
                className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSave} disabled={saving}>
                  Save template
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
