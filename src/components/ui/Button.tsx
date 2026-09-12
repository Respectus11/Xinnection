import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  // Gold is the single accent — one primary action per screen, never a wash.
  // Press: subtle scale-down (80ms). Hover: soft gold glow, no movement.
  primary:
    "bg-gold text-ink shadow-rest hover:bg-gold-deep hover:shadow-glow active:scale-[0.98]",
  secondary:
    "border border-ink/30 bg-white/70 text-ink shadow-rest hover:border-ink/60 hover:shadow-lift active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink underline underline-offset-4 hover:text-ink/75 active:scale-[0.98]",
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-[background-color,border-color,box-shadow,transform] duration-150 ease-soft active:duration-[80ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:saturate-50 ${variantClasses[variant]} ${className}`}
    />
  );
}
