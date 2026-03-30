'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Star, MessageSquare, BarChart3, TrendingUp, Trophy, Smile, Meh, Frown } from 'lucide-react'

interface Profile { id: string; business_name: string }

interface ReportData {
  ratingTrend: { date: string; avgRating: number; count: number }[]
  ratingDistribution: { rating: number; count: number }[]
  responseRate: number
  sentimentCounts: { positive: number; neutral: number; negative: number; unanalyzed: number }
  leaderboard: { profileId: string; businessName: string; avgRating: number; total: number; replied: number }[]
  summary: {
    periodTotal: number
    periodAvg: number | null
    allTimeTotal: number
    allTimeReplied: number
  }
}

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

export function ReportsClient({ profiles }: { profiles: Profile[] }) {
  const [profileId, setProfileId] = useState<string>('')
  const [range, setRange] = useState(30)
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ range: String(range) })
    if (profileId) params.set('profileId', profileId)
    fetch(`/api/reports?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [profileId, range])

  const stat = (icon: React.ReactNode, label: string, value: string | number, sub?: string) => (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )

  const noData = !loading && (!data?.ratingTrend?.length && !data?.summary?.allTimeTotal)

  // Sentiment bar helpers
  const sentimentTotal = data
    ? data.sentimentCounts.positive + data.sentimentCounts.neutral + data.sentimentCounts.negative
    : 0
  const sentimentPct = (n: number) => sentimentTotal > 0 ? Math.round((n / sentimentTotal) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="h-8 text-sm rounded-lg border border-border bg-card px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All profiles</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.business_name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                range === r.value
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : noData ? (
        <div className="rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center py-16 text-center gap-3">
          <BarChart3 className="w-8 h-8 text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-sm">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Sync reviews from the Reviews page to see reports.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stat(<Star className="w-3.5 h-3.5" />, `Reviews (${RANGES.find(r=>r.value===range)?.label})`, data?.summary.periodTotal ?? 0)}
            {stat(<TrendingUp className="w-3.5 h-3.5" />, 'Avg rating (period)', data?.summary.periodAvg ? `${data.summary.periodAvg} ★` : '—')}
            {stat(<MessageSquare className="w-3.5 h-3.5" />, 'Response rate', `${data?.responseRate ?? 0}%`, 'all time')}
            {stat(<BarChart3 className="w-3.5 h-3.5" />, 'Total reviews', data?.summary.allTimeTotal ?? 0, 'all time')}
          </div>

          {/* Rating trend chart */}
          {(data?.ratingTrend?.length ?? 0) > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Rating trend — last {range} days
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data!.ratingTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    formatter={(v) => [`${v} ★`, 'Avg rating']}
                    labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Volume chart */}
            {(data?.ratingTrend?.length ?? 0) > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Review volume
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data!.ratingTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                      formatter={(v) => [v, 'Reviews']}
                      labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rating distribution */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Rating breakdown (all time)
              </p>
              <div className="space-y-2.5">
                {(data?.ratingDistribution ?? []).map(({ rating, count }) => {
                  const total = data?.summary.allTimeTotal ?? 0
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs w-4 text-right text-muted-foreground shrink-0">{rating}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 tabular-nums shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>

              {/* Response rate ring */}
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="3"
                      strokeDasharray={`${(data?.responseRate ?? 0)} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {data?.responseRate ?? 0}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Response rate</p>
                  <p className="text-xs text-muted-foreground">
                    {data?.summary.allTimeReplied ?? 0} of {data?.summary.allTimeTotal ?? 0} reviews replied
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment breakdown */}
          {sentimentTotal > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                Sentiment analysis (all time)
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Positive', key: 'positive' as const, icon: <Smile className="w-3.5 h-3.5" />, color: 'bg-green-500', text: 'text-green-600' },
                  { label: 'Neutral',  key: 'neutral'  as const, icon: <Meh  className="w-3.5 h-3.5" />, color: 'bg-amber-400', text: 'text-amber-600' },
                  { label: 'Negative', key: 'negative' as const, icon: <Frown className="w-3.5 h-3.5" />, color: 'bg-red-500',   text: 'text-red-600'   },
                ].map(({ label, key, icon, color, text }) => {
                  const count = data?.sentimentCounts[key] ?? 0
                  const pct = sentimentPct(count)
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 w-20 shrink-0 ${text}`}>
                        {icon}
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-14 text-right shrink-0">
                        {count} ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>
              {(data?.sentimentCounts.unanalyzed ?? 0) > 0 && (
                <p className="text-[10px] text-muted-foreground mt-3">
                  {data!.sentimentCounts.unanalyzed} reviews pending analysis — runs nightly automatically.
                </p>
              )}
            </div>
          )}

          {/* Leaderboard */}
          {(data?.leaderboard?.length ?? 0) > 1 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Profile leaderboard (all time)
                </p>
              </div>
              <div className="space-y-2">
                {data!.leaderboard.map((entry, i) => {
                  const replyRate = entry.total > 0 ? Math.round((entry.replied / entry.total) * 100) : 0
                  return (
                    <div key={entry.profileId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <span className={`text-sm font-bold w-5 shrink-0 tabular-nums ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.businessName}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.total} reviews · {replyRate}% replied</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-bold tabular-nums">{entry.avgRating.toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
