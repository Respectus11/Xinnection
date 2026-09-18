import { HighlandsMark } from "./HighlandsMark";

// Warm empty state — a moment of the motif and a sentence, never a blank
// pane and never an error-shaped void.
export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <HighlandsMark variant="mark" className="mb-4 h-9 w-auto text-[#4ED8BD]" />
      <p className="font-semibold text-white">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-slate-300 font-medium">{body}</p>}
    </div>
  );
}
