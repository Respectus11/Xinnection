"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

export function ThreadLookupForm({ notFound = false }: { notFound?: boolean }) {
  const t = useTranslations("lookup");
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {notFound && (
        <p role="alert" className="mt-3 text-flag">
          {t("notFound")}
        </p>
      )}
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = code.trim();
          if (trimmed) router.push(`/thread/${encodeURIComponent(trimmed)}`);
        }}
      >
        <Label htmlFor="code">{t("label")}</Label>
        <Input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t("placeholder")}
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" variant="primary" className="mt-3 w-full" disabled={!code.trim()}>
          {t("action")}
        </Button>
      </form>
    </section>
  );
}
