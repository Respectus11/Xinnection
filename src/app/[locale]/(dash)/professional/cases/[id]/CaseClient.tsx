"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FlagIcon } from "@/components/ui/icons";
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
  const [confirmFlag, setConfirmFlag] = useState(false);

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
        setConfirmFlag(false);
        router.refresh();
      }
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 border-t border-line pt-7">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-ink/60">{t("statusLabel")}</span>
        <div
          role="group"
          aria-label={t("statusLabel")}
          className="inline-flex flex-wrap gap-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(14,22,36,0.72)] p-1 shadow-rest"
        >
          {STATUSES.map((s) => {
            const active = s === status;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                disabled={busy}
                onClick={() => changeStatus(s)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-not-allowed ${
                  active
                    ? "bg-[rgba(34,153,130,0.25)] text-[#4ED8BD] border border-[rgba(78,216,189,0.4)]"
                    : "text-[rgba(241,245,249,0.7)] hover:text-[#F1F5F9]"
                }`}
              >
                {tStatus(STATUS_KEYS[s])}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <Label htmlFor="case-reply">{t("replyLabel")}</Label>
        <Textarea
          id="case-reply"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          maxLength={5000}
          rows={4}
        />
        {notice && (
          <p role="alert" className="mt-2 text-flag">
            {notice}
          </p>
        )}
        <Button
          variant="primary"
          className="mt-3"
          onClick={sendReply}
          disabled={busy || !reply.trim()}
        >
          {t("send")}
        </Button>
      </div>

      <div className="mt-9 border-t border-line pt-6">
        {flagDone ? (
          <p className="pill pill-flag">
            <FlagIcon className="h-3.5 w-3.5" />
            {t("flaggedDone")}
          </p>
        ) : (
          <>
            <Button
              variant="secondary"
              style={{
                background: "rgba(217, 107, 88, 0.12)",
                border: "1px solid rgba(217, 107, 88, 0.35)",
                color: "#D96B58",
              }}
              onClick={() => setConfirmFlag(true)}
              disabled={busy}
            >
              <FlagIcon />
              {t("flag")}
            </Button>
            <Dialog
              open={confirmFlag}
              onClose={() => setConfirmFlag(false)}
              labelledBy="flag-confirm-title"
              title={t("flag")}
              closeLabel={tCommon("cancel")}
            >
              <p className="mt-4 leading-relaxed text-ink/85">{t("flagConfirm")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="border-flag/50 text-flag hover:border-flag hover:bg-flag/5"
                  onClick={flagHighRisk}
                  disabled={busy}
                >
                  {t("flag")}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmFlag(false)}>
                  {tCommon("cancel")}
                </Button>
              </div>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
