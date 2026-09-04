"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

// Optimistic claim: the button locks immediately, then the server confirms.
// A 409 (someone else won the race) surfaces as a friendly inline note —
// never an error page.
export function ClaimButton({ threadId }: { threadId: string }) {
  const t = useTranslations("queue");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  async function claim() {
    if (busy) return;
    setBusy(true);
    setAlreadyClaimed(false);
    try {
      const res = await fetch(`/api/professional/threads/${threadId}/claim`, { method: "POST" });
      if (res.ok) {
        router.push(`/professional/cases/${threadId}`);
        return;
      }
      setAlreadyClaimed(true);
      router.refresh();
    } catch {
      setAlreadyClaimed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <Button variant="primary" onClick={claim} disabled={busy}>
        {busy ? t("claiming") : t("claim")}
      </Button>
      {alreadyClaimed && (
        <p className="mt-1 max-w-48 text-xs text-ink/60">{t("alreadyClaimed")}</p>
      )}
    </div>
  );
}
