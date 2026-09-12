// The single grounded illustrative motif: the Ethiopian highlands at dusk —
// soft layered hill silhouettes with a small meskel daisy (a symbol of hope
// and renewal) resting on the ridge. Pure inline SVG, tinted with
// currentColor, used sparingly: never more than once or twice per screen,
// never competing with content. Decorative — always aria-hidden.
function Daisy({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return {
      x2: cx + r * Math.cos(angle),
      y2: cy + r * Math.sin(angle),
    };
  });
  return (
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
      {petals.map((petal, i) => (
        <line key={i} x1={cx} y1={cy} x2={petal.x2} y2={petal.y2} />
      ))}
      <circle cx={cx} cy={cy} r="1.7" fill="currentColor" stroke="none" />
    </g>
  );
}

export function HighlandsMark({
  variant = "mark",
  className = "",
}: {
  variant?: "mark" | "horizon";
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
        <g className="text-gold">
          <Daisy cx={296} cy={148} r={6.5} />
          <Daisy cx={318} cy={142} r={5} />
        </g>
      </svg>
    );
  }

  // Compact mark — headers, footers, empty states.
  return (
    <svg viewBox="0 0 48 34" aria-hidden className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 26 Q 12 15 23 21 T 46 23" />
        <path d="M2 31 Q 18 24 33 28.5 T 46 29.5" opacity="0.5" />
      </g>
      <g className="text-gold">
        <Daisy cx={35} cy={11} r={6} />
      </g>
    </svg>
  );
}
