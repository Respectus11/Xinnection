import type { ReactNode } from "react";

// Serif display heading — where the editorial register lives. Kickers are
// sentence-case; there is no tracked-out caps anywhere in the system.
export function SectionHeading({
  title,
  kicker,
  size = "page",
  id,
  className = "",
  children,
}: {
  title: string;
  kicker?: string;
  size?: "page" | "hero";
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  const sizeClasses =
    size === "hero" ? "text-3xl sm:text-4xl" : "text-2xl";
  return (
    <header className={className}>
      {kicker && <p className="text-sm font-medium text-slate-300">{kicker}</p>}
      <h1 id={id} className={`display mt-1 text-ink ${sizeClasses}`}>
        {title}
      </h1>
      {children}
    </header>
  );
}
