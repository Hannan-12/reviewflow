import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-16 h-7 mb-1.5" />
      <Skeleton className="w-24 h-3" />
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-32 h-3.5" />
          <Skeleton className="w-20 h-3" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-3/4 h-3" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <Skeleton className="flex-1 h-3" />
      <Skeleton className="w-20 h-3 shrink-0" />
      <Skeleton className="w-16 h-5 rounded-full shrink-0" />
    </div>
  )
}
