// Skeleton shaped like the queue — heading, sticky filter bar, hairline rows —
// so the page lands in place instead of jumping.
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl" aria-hidden>
      <div className="h-4 w-64 animate-pulse rounded bg-white/70" />
      <div className="mt-2 h-9 w-80 animate-pulse rounded bg-white/70" />
      <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-white/50" />
      <div className="mt-2 border-t border-line">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4 border-b border-line py-3.5">
            <span className="h-2 w-2 rounded-full bg-line" />
            <div className="min-w-0 flex-1">
              <div className="h-3.5 w-44 animate-pulse rounded bg-white/70" />
              <div className="mt-2 h-3 w-28 animate-pulse rounded bg-white/50" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded-md bg-white/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
