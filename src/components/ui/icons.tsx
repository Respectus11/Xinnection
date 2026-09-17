// Handcrafted bespoke SVG icon set — balanced 1.5px strokes, optical centering, currentColor.
// Replaces generic emojis with professional, human-designer-grade vector iconography.
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

/**
 * US Flag glyph used for English language selection.
 */
export function UsFlagIcon({ className = "h-3.5 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 14" fill="none" aria-hidden className={`${base} ${className} rounded-[2px] overflow-hidden shrink-0`}>
      <rect width="20" height="14" fill="#B22234" />
      <rect y="2.15" width="20" height="2.15" fill="#FFFFFF" />
      <rect y="6.45" width="20" height="2.15" fill="#FFFFFF" />
      <rect y="10.75" width="20" height="2.15" fill="#FFFFFF" />
      <rect width="9" height="7.5" fill="#3C3B6E" />
      <circle cx="2.5" cy="2.2" r="0.65" fill="#FFFFFF" />
      <circle cx="6.5" cy="2.2" r="0.65" fill="#FFFFFF" />
      <circle cx="4.5" cy="3.8" r="0.65" fill="#FFFFFF" />
      <circle cx="2.5" cy="5.4" r="0.65" fill="#FFFFFF" />
      <circle cx="6.5" cy="5.4" r="0.65" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Ethiopian flag glyph used for Amharic, Afaan Oromoo, and Tigrinya regional languages.
 */
export function EtFlagIcon({ className = "h-3.5 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 14" fill="none" aria-hidden className={`${base} ${className} rounded-[2px] overflow-hidden shrink-0`}>
      <rect width="20" height="4.67" fill="#078930" />
      <rect y="4.67" width="20" height="4.67" fill="#FCDD09" />
      <rect y="9.34" width="20" height="4.66" fill="#DA121A" />
      <circle cx="10" cy="7" r="2.8" fill="#0F47AF" />
      <polygon points="10,4.8 10.6,6.3 12.2,6.3 10.9,7.3 11.4,8.8 10,7.9 8.6,8.8 9.1,7.3 7.8,6.3 9.4,6.3" fill="#FCDD09" />
    </svg>
  );
}

/* ── Trust & Core Feature Icons (replacing emojis) ── */

export function ShieldLockIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`${base} ${className}`}>
      <path
        d="M10 2.5L3.75 5.3C3.75 10.9 6.4 15.6 10 17.5C13.6 15.6 16.25 10.9 16.25 5.3L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="7.5" y="9" width="5" height="4.2" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.5 9V7.5C8.5 6.67 9.17 6 10 6C10.83 6 11.5 6.67 11.5 7.5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function MessageBubbleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`${base} ${className}`}>
      <path
        d="M16.5 9.5C16.5 13.09 13.59 16 10 16C8.82 16 7.72 15.68 6.78 15.12L3.5 16.5L4.88 13.22C4.32 12.28 4 11.18 4 10C4 6.41 6.91 3.5 10.5 3.5C14.09 3.5 17 6.41 17 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="10" r="0.9" fill="currentColor" />
      <circle cx="10.5" cy="10" r="0.9" fill="currentColor" />
      <circle cx="13" cy="10" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function GlobeNetworkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 10H17.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M10 2.75C11.8 4.7 12.8 7.25 12.8 10C12.8 12.75 11.8 15.3 10 17.25C8.2 15.3 7.2 12.75 7.2 10C7.2 7.25 8.2 4.7 10 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/* ── Category Micro-Icons ── */

export function AnxietyIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M4 14V11.5C2.8 10.5 2.2 8.8 2.5 7C2.9 4.2 5.2 2.5 8 2.5C10.8 2.5 13.1 4.2 13.5 7C13.8 8.8 13.2 10.5 12 11.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 7.5C6.2 6.8 6.8 6.8 7.5 7.5C8.2 8.2 8.8 8.2 9.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function GriefIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M8 2.5C8 2.5 3.5 8 3.5 10.5C3.5 12.98 5.52 15 8 15C10.48 15 12.5 12.98 12.5 10.5C12.5 8 8 2.5 8 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RelationshipsIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13C2 10.8 3.5 9.8 5 9.8C6.5 9.8 8 10.8 8 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 13C8 10.8 9.5 9.8 11 9.8C12.5 9.8 14 10.8 14 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function AcademicIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M8 3L2 6.5L8 10L14 6.5L8 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 7.67V11C4 12.5 5.79 13.5 8 13.5C10.21 13.5 12 12.5 12 11V7.67" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function FamilyIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <path d="M2.5 7.5L8 3L13.5 7.5V13.5H2.5V7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 13.5V9.5H9.5V13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WorkIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <rect x="2.5" y="5.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 5.5V4C6 3.45 6.45 3 7 3H9C9.55 3 10 3.45 10 4V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 9H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AlertDiamondIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V11.5M4.5 8H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function HorizonIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
      <path d="M6 10C6.8 10.7 9.2 10.7 10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Single user profile avatar outline icon.
 */
export function UserIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="8" cy="5" r="2.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 13.5C3.5 11 5.5 10 8 10C10.5 10 12.5 11 12.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Community/group outline icon representing supporters and care teams.
 */
export function UsersGroupIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="6" cy="5.25" r="2.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13C2 10.8 3.8 9.75 6 9.75C8.2 9.75 10 10.8 10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 3.5C11.5 4 12 5.1 12 6.25C12 7.4 11.5 8.5 10.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 10.5C13.2 11.2 14 12.2 14 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

