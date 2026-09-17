import Image from "next/image";

/**
 * HighlandsMark brand iconography component.
 *
 * Variants:
 * - "mark": The official Xinnection logo mark (intertwined brain & heart empathy glyph).
 * - "horizon": A serene, low-contrast topographical landscape silhouette used as atmospheric background texture.
 */
export function HighlandsMark({
  variant = "mark",
  className = "",
}: {
  /** Display variant: official logo mark or scenic horizon backdrop */
  variant?: "mark" | "horizon";
  /** Optional additional CSS classes */
  className?: string;
}) {
  if (variant === "horizon") {
    // Wide horizon band — sits behind the seeker hero at very low contrast.
    return (
      <svg
        viewBox="0 0 720 220"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
        className={className}
      >
        <path
          d="M0 150 Q 120 96 260 128 T 520 118 T 720 142 V220 H0 Z"
          fill="currentColor"
          opacity="0.07"
        />
        <path
          d="M0 172 Q 180 122 340 154 T 720 158 V220 H0 Z"
          fill="currentColor"
          opacity="0.1"
        />
        <path
          d="M0 192 Q 240 154 460 180 T 720 178 V220 H0 Z"
          fill="currentColor"
          opacity="0.13"
        />
      </svg>
    );
  }

  // Official Xinnection logo: brain hugging a heart
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        boxShadow: "0 0 16px rgba(78,216,189,0.15)",
      }}
    >
      <Image
        src="/logo.png"
        alt="Xinnection Logo"
        width={64}
        height={64}
        priority
        className="h-full w-full object-contain"
      />
    </span>
  );
}
