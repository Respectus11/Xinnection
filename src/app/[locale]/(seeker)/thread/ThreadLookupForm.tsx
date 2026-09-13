"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { HighlandsMark } from "@/components/ui/HighlandsMark";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

export function ThreadLookupForm({ notFound = false }: { notFound?: boolean }) {
  const t = useTranslations("lookup");
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <section className="card mx-auto mt-6 max-w-md p-6 sm:p-8">
      <HighlandsMark variant="mark" className="h-6 w-auto text-eucalyptus/70" />
      <h1 className="display mt-3 text-2xl text-ink">{t("title")}</h1>
      {notFound && (
        <p role="alert" className="mt-3 text-flag">
          {t("notFound")}
        </p>
      )}
      <form
        className="mt-5"
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
        <Button type="submit" variant="primary" className="mt-4 w-full" disabled={!code.trim()}>
          {t("action")}
        </Button>
      </form>
    </section>
  );
}
