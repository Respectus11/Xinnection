"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";

export function ProfessionalActions({
  professionalId,
  status,
}: {
  professionalId: string;
  status: string;
}) {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function act(action: "suspend" | "reinstate") {
    if (busy) return;
    if (action === "suspend" && !reason.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      if (!res.ok) setNotice(tCommon("errorGeneric"));
      else {
        setSuspending(false);
        setReason("");
        router.refresh();
      }
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  if (status === "SUSPENDED") {
    return (
      <div>
        <Button variant="secondary" onClick={() => act("reinstate")} disabled={busy}>
          {t("reinstate")}
        </Button>
        {notice && (
          <p role="alert" className="mt-2 text-flag">
            {notice}
          </p>
        )}
      </div>
    );
  }

  if (status !== "ACTIVE") return null;

  return (
    <div>
      <Button variant="secondary" onClick={() => setSuspending((v) => !v)}>
        {t("suspend")}
      </Button>
      {suspending && (
        <div className="mt-3 max-w-lg">
          <Textarea
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("suspendReason")}
            aria-label={t("suspendReason")}
          />
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => act("suspend")}
            disabled={busy || !reason.trim()}
          >
            {t("suspend")}
          </Button>
          <Button variant="ghost" className="ml-2" onClick={() => setSuspending(false)}>
            {tCommon("cancel")}
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
