import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  // Solid gold is reserved for the single primary action on a screen.
  primary: "bg-gold text-ink hover:brightness-95 focus-visible:outline-ink",
  secondary: "border border-ink/30 bg-transparent text-ink hover:border-ink focus-visible:outline-ink",
  ghost: "bg-transparent text-ink underline underline-offset-4 hover:text-ink/80 focus-visible:outline-ink",
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
      className={`inline-flex min-h-11 items-center justify-center rounded px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
    />
  );
}
