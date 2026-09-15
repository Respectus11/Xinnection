// Skeleton shaped like the thread — two turns on the vertical line plus the
// reply composer — so the conversation lands in place instead of jumping.
export default function Loading() {
  return (
    <div aria-hidden>
      <div className="card p-6 sm:p-8">
        <div className="relative ml-1">
          {[0, 1].map((turn) => (
            <div key={turn} className="relative pb-8 pl-8 last:pb-0">
              <span className="threadline-seg" />
              <span className="absolute left-0 top-[7px] h-[15px] w-[15px] rounded-full border-2 border-dusk bg-mist" />
              <div>
                <div className="h-3 w-16 animate-pulse rounded bg-white/70" />
                <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-white/70" />
                <div className="mt-1.5 h-4 w-2/3 max-w-sm animate-pulse rounded bg-white/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 border-t border-line pt-8">
        <div className="h-24 w-full animate-pulse rounded-md border border-line bg-white/60" />
      </div>
    </div>
  );
}
