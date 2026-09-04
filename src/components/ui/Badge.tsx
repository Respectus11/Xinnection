import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "eucalyptus" | "flag";

const toneClasses: Record<Tone, string> = {
  neutral: "border-ink/25 text-ink/80",
  // Selected category state: gold border, never a filled background.
  gold: "border-gold text-ink",
  eucalyptus: "border-eucalyptus text-eucalyptus-deep",
  flag: "border-flag text-flag",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-sm font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
