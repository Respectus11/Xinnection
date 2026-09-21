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
        }),
      });
      if (res.status === 423) {
        setError(t("suspended"));
        return;
      }
      if (res.status === 401) {
        setError(t("invalid"));
        return;
      }
      if (!res.ok) {
        setError(tCommon("errorGeneric"));
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
      <HighlandsMark variant="mark" className="h-12 w-12" />
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
        {error && (
          <p role="alert" className="text-sm font-medium" style={{ color: "#F87171" }}>
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
