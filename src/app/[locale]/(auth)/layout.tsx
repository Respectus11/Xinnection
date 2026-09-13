// Shared chrome for the login screens: a centered elevated card on mist with
// ambient light — calm and quiet; the dusk register begins after sign-in.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="atmosphere min-h-screen">
      <main className="mx-auto max-w-[420px] px-4 pb-24 pt-16 sm:pt-20">{children}</main>
    </div>
  );
}
