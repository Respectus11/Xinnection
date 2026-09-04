export type ThreadLineTurn = {
  id: string;
  role: "SEEKER" | "PROFESSIONAL";
  text: string;
  at: string; // preformatted relative time — kept small and muted
};

// The core visual motif: a single quiet vertical rule running down the left
// of any conversation view, connecting seeker and professional. It marks the
// turns of the conversation — structural, not decorative. Timestamps are
// deliberately de-emphasized.
export function ThreadLine({
  turns,
  labels,
}: {
  turns: ThreadLineTurn[];
  labels: { seeker: string; professional: string };
}) {
  return (
    <ol className="threadline-reveal relative ml-2 space-y-8 border-l border-line pl-6">
      {turns.map((turn) => (
        <li key={turn.id} className="relative">
          <span
            aria-hidden
            className={`absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full ${
              turn.role === "SEEKER" ? "bg-dusk" : "border-2 border-dusk bg-mist"
            }`}
          />
          <p className="text-sm font-semibold text-ink/60">
            {turn.role === "SEEKER" ? labels.seeker : labels.professional}
          </p>
          <p className="mt-1 whitespace-pre-wrap">{turn.text}</p>
          <p className="mt-1 text-xs text-ink/40">{turn.at}</p>
        </li>
      ))}
    </ol>
  );
}
