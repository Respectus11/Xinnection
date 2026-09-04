"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";

export function OnboardingActions({ professionalId }: { professionalId: string }) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    if (busy) return;
    if (action === "reject" && !reason.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      if (!res.ok) setNotice(tCommon("errorGeneric"));
      else router.refresh();
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => act("approve")} disabled={busy}>
          {t("approve")}
        </Button>
        <Button variant="secondary" onClick={() => setRejecting((v) => !v)}>
          {t("reject")}
        </Button>
      </div>
      {rejecting && (
        <div className="mt-3 max-w-lg">
          <Textarea
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("rejectReason")}
            aria-label={t("rejectReason")}
          />
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => act("reject")}
            disabled={busy || !reason.trim()}
          >
            {t("reject")}
          </Button>
        </div>
      )}
      {notice && (
        <p role="alert" className="mt-2 text-flag">
          {notice}
        </p>
      )}
    </div>
  );
}
