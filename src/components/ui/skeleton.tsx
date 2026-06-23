import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white/5 animate-pulse',
        'relative overflow-hidden',
        'after:absolute after:inset-0 after:bg-shimmer after:bg-[length:1000px_100%] after:animate-shimmer',
        className
      )}
    />
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="w-48 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex-shrink-0">
      <Skeleton className="aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ChannelRowSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <ChannelCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-[70vh] bg-zinc-900 flex items-end">
      <div className="p-16 space-y-4 w-full max-w-2xl">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-14 w-1/2" />
        <Skeleton className="h-5 w-96" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="aspect-video rounded-xl bg-zinc-900 flex items-center justify-center">
      <div className="text-white/30 text-center">
        <div className="w-16 h-16 border-4 border-white/10 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading player...</p>
      </div>
    </div>
  );
}

export default Skeleton;
