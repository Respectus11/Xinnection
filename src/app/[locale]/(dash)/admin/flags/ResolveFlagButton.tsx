"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function ResolveFlagButton({ flagId }: { flagId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={resolve} disabled={busy}>
      {t("resolve")}
    </Button>
  );
}
