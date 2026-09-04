// Shared minimal chrome for the login screens.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-[640px] px-4 pb-24 pt-16">{children}</main>;
}
