"use client";

import { useRef } from "react";

export type ThreadLineTurn = {
  id: string;
  role: "SEEKER" | "PROFESSIONAL";
  text: string;
  at: string; // preformatted relative time — kept small and muted
};

// The core visual motif, shared by both ends of the same conversation: one
// quiet vertical line connecting the turns. When a new turn arrives through
// the periodic refresh, the line extends downward to meet it — 250ms, once,
// only for the turn that is genuinely new. The initial server render never
// animates, and a refresh never replays the past. This is the one deliberate
// motion moment in the product.
export function ThreadLine({
  turns,
  labels,
}: {
  turns: ThreadLineTurn[];
  labels: { seeker: string; professional: string };
}) {
  const seen = useRef<Set<string> | null>(null);
  let fresh: Set<string> | null = null;
  if (seen.current === null) {
    seen.current = new Set(turns.map((turn) => turn.id));
  } else {
    fresh = new Set(
      turns.filter((turn) => !seen.current?.has(turn.id)).map((turn) => turn.id),
    );
    seen.current = new Set(turns.map((turn) => turn.id));
  }
  const last = turns[turns.length - 1];

  return (
    <div>
      <ol className="threadline relative ml-1">
        {turns.map((turn) => (
          <li
            key={turn.id}
            data-new={fresh?.has(turn.id) ? "true" : undefined}
            className="relative pb-8 pl-8 last:pb-0"
          >
            <span aria-hidden className="threadline-seg" />
            <span
              aria-hidden
              className={`absolute left-0 top-[7px] h-[15px] w-[15px] rounded-full border-2 border-dusk ${
                turn.role === "SEEKER" ? "bg-dusk" : "bg-mist"
              }`}
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}
            />
            <div className="threadline-body">
              <p className="text-sm font-semibold text-ink/55">
                {turn.role === "SEEKER" ? labels.seeker : labels.professional}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-ink/95">{turn.text}</p>
              <p className="tnum mt-1.5 text-xs text-ink/40">{turn.at}</p>
            </div>
          </li>
        ))}
      </ol>
      {/* New replies are announced politely; initial load stays silent. */}
      {last && (
        <p role="status" className="sr-only">
          {last.role === "SEEKER" ? labels.seeker : labels.professional}: {last.text}
        </p>
      )}
    </div>
  );
}
