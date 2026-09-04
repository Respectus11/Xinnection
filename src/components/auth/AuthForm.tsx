"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

// Shared sign-in form for professionals and admins. Email + password + TOTP
// in one step; there is no self-registration — accounts are provisioned
// through the admin onboarding flow.
export function AuthForm({ portal }: { portal: "professional" | "admin" }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ portal, email: email.trim(), password, totp: totp.trim() }),
      });
      if (res.status === 423) {
        setError(t("suspended"));
        return;
      }
      if (!res.ok) {
        setError(t("invalid"));
        return;
      }
      router.replace(portal === "admin" ? "/admin" : "/professional");
      router.refresh();
    } catch {
      setError(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{portal === "admin" ? t("adminTitle") : t("professionalTitle")}</h1>
      <form className="mt-6 space-y-4" onSubmit={signIn}>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <Label htmlFor="totp">{t("totp")}</Label>
          <Input
            id="totp"
            inputMode="numeric"
            value={totp}
            onChange={(event) => setTotp(event.target.value)}
            autoComplete="one-time-code"
            placeholder="123456"
            required
          />
          <p className="mt-1 text-xs text-ink/50">{t("totpHint")}</p>
        </div>
        {error && (
          <p role="alert" className="text-flag">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </section>
  );
}
