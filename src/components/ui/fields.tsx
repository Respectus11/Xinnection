import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldStyle: React.CSSProperties = {
  background: "rgba(14, 22, 36, 0.72)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#F1F5F9",
  backdropFilter: "blur(12px)",
};

const fieldClasses =
  "w-full rounded-xl px-4 py-3.5 text-base transition-all duration-200 ease-soft placeholder:text-[rgba(148,163,184,0.45)] focus:outline-none focus:ring-2 focus:ring-[rgba(78,216,189,0.4)] focus:border-[rgba(78,216,189,0.55)]";

export function Input({
  className = "",
  style,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...fieldStyle, ...style }}
      className={`${fieldClasses} ${className}`}
    />
  );
}

export function Textarea({
  className = "",
  style,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...fieldStyle, ...style }}
      className={`${fieldClasses} min-h-32 leading-relaxed resize-none ${className}`}
    />
  );
}

export function Select({
  className = "",
  style,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...fieldStyle, ...style }}
      className={`${fieldClasses} py-2 text-sm ${className}`}
    />
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em]"
      style={{ color: "rgba(216,240,236,0.5)" }}
    >
      {children}
    </label>
  );
}
