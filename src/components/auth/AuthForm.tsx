"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

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
        body: JSON.stringify({
          portal,
          email: email.trim(),
          password,
          ...(portal === "admin" ? { totp: totp.trim() } : {}),
        }),
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
    <section className="card p-6 sm:p-8">
      <span style={{ color: "#4ED8BD" }}>
        <HighlandsMark variant="mark" className="h-6 w-auto" />
      </span>
      <h1 className="display mt-3 text-2xl font-bold" style={{ color: "#F1F5F9" }}>
        {portal === "admin" ? t("adminTitle") : t("professionalTitle")}
      </h1>
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
        {portal === "admin" && (
          <div>
            <Label htmlFor="totp">{t("totp")}</Label>
            <Input
              id="totp"
              inputMode="numeric"
              value={totp}
              onChange={(event) => setTotp(event.target.value)}
              autoComplete="one-time-code"
              placeholder="123456"
              className="tnum"
              required
            />
            <p className="mt-1.5 text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>{t("totpHint")}</p>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm" style={{ color: "#D96B58" }}>
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
