// Minimal inline icon set — small strokes, currentColor, no icon dependency.
// Used sparingly; icons never replace words where words matter.
type IconProps = { className?: string };

const base = "inline-block shrink-0 align-[-0.125em]";

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M3 8.5 6.2 11.5 13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlagIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M3.5 14V2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3.5 3h8.2l-1.8 2.7 1.8 2.8H3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
