import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "eucalyptus" | "flag";

// Status and meta indicators. Each tone is a subtle vertical gradient with a
// soft inset highlight — small dimensional touches, never flat single-color
// fills, never skeuomorphic. See .pill-* in globals.css.
const toneClasses: Record<Tone, string> = {
  neutral: "pill-neutral",
  gold: "pill-gold",
  eucalyptus: "pill-eucalyptus",
  flag: "pill-flag",
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
    <span className={`pill ${toneClasses[tone]} ${className}`}>{children}</span>
  );
}
