"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/fields";
import { STATUS_KEYS } from "@/components/status";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"] as const;

// Interactive controls for an open case: status transitions, professional
// replies, and the single-click high-risk flag. These call the API layer,
// which re-validates role ownership — the UI is convenience, not access.
export function CaseClient({
  threadId,
  status,
  flagged,
}: {
  threadId: string;
  status: string;
  flagged: boolean;
}) {
  const t = useTranslations("case");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [flagDone, setFlagDone] = useState(flagged);

  async function changeStatus(next: string) {
    if (busy || next === status) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/professional/threads/${threadId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) setNotice(tCommon("errorGeneric"));
      else router.refresh();
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!reply.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (!res.ok) setNotice(tCommon("errorGeneric"));
      else {
        setReply("");
        router.refresh();
      }
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  async function flagHighRisk() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/professional/threads/${threadId}/flag`, { method: "POST" });
      if (!res.ok) setNotice(tCommon("errorGeneric"));
      else {
        setFlagDone(true);
        router.refresh();
      }
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-12 border-t border-line pt-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-ink/60">{t("statusLabel")}</span>
        {STATUSES.map((s) => {
          const active = s === status;
          const tone = s === "RESOLVED" ? "eucalyptus" : s === "ESCALATED" ? "flag" : "neutral";
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              disabled={busy}
              onClick={() => changeStatus(s)}
              className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active ? "" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Badge tone={tone}>{tStatus(STATUS_KEYS[s])}</Badge>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Label htmlFor="case-reply">{t("replyLabel")}</Label>
        <Textarea
          id="case-reply"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          maxLength={5000}
          rows={4}
          className="mt-1"
        />
        {notice && (
          <p role="alert" className="mt-2 text-flag">
            {notice}
          </p>
        )}
        <Button variant="primary" className="mt-3" onClick={sendReply} disabled={busy || !reply.trim()}>
          {t("send")}
        </Button>
      </div>

      <div className="mt-8 border-t border-line pt-6">
        {flagDone ? (
          <Badge tone="flag">{t("flaggedDone")}</Badge>
        ) : (
          <Button variant="secondary" onClick={flagHighRisk} disabled={busy}>
            {t("flag")}
          </Button>
        )}
      </div>
    </div>
  );
}
