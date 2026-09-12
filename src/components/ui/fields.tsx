import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Fields carry a quiet rest shadow and gain real lift on focus — physical,
// not flashy. Focus ring is ink for guaranteed contrast.
const fieldClasses =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-base text-ink shadow-rest placeholder:text-ink/35 transition-shadow duration-150 ease-soft focus:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClasses} ${className}`} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClasses} min-h-32 leading-relaxed ${className}`}
    />
  );
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClasses} py-1.5 text-sm ${className}`} />;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}
