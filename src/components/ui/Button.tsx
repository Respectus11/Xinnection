import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

// Handcrafted tactile button aesthetics — subtle micro-depth, soft specular inset, obsidian and eucalyptus tones
const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #32BCA0 0%, #1E8A74 100%)",
    color: "#090D15",
    border: "1px solid rgba(78, 216, 189, 0.45)",
    boxShadow: "0 2px 14px rgba(34, 153, 130, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#F1F5F9",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(226, 232, 240, 0.75)",
  },
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      type={type}
      style={{ ...variantStyles[variant], ...style }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold tracking-tight transition-all duration-150 ease-soft active:duration-[80ms] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
