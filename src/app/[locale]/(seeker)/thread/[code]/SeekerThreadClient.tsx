"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Label, Textarea } from "@/components/ui/fields";
import { CopyIcon, CheckIcon } from "@/components/ui/icons";

// Seeker-side thread controls: adding a turn (proven by the anonymous code)
// and the no-friction "delete my data" action with a plain-language confirm
// dialog. The quiet 20s refresh works everywhere, including flaky networks;
// new replies reach the visitor through the ThreadLine's extend motion.
const ACTIVE_CODE_KEY = "xinnection_active_code";

export function SeekerThreadClient({ threadId, code }: { threadId: string; code: string }) {
  const t = useTranslations("thread");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (code) {
        window.localStorage.setItem(ACTIVE_CODE_KEY, code);
      }
    } catch {
      // Ignore
    }
  }, [code]);

  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), 20000);
    return () => window.clearInterval(id);
  }, [router]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function sendReply() {
    if (!reply.trim() || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: reply.trim(), code }),
      });
      if (res.status === 429) {
        setNotice(tCommon("rateLimited"));
        return;
      }
      if (!res.ok) {
        setNotice(tCommon("errorGeneric"));
        return;
      }
      setReply("");
      router.refresh();
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setSending(false);
    }
  }

  async function deleteThread() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        try {
          window.localStorage.removeItem(ACTIVE_CODE_KEY);
        } catch {
          // Ignore
        }
        setDeleted(true);
      } else {
        setNotice(tCommon("errorGeneric"));
      }
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return <p className="card p-6 leading-relaxed text-sm" style={{ color: "#F1F5F9" }}>{t("deleted")}</p>;
  }

  return (
    <div className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-8">
      {/* Code recovery banner */}
      <div
        className="mb-8 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
        style={{
          background: "rgba(34, 153, 130, 0.12)",
          border: "1px solid rgba(78, 216, 189, 0.35)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4ED8BD] shadow-[0_0_8px_#4ED8BD]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4ED8BD]">
              Your Anonymous Access Code
            </p>
          </div>
          <p className="mt-1 font-mono text-base sm:text-lg font-bold tracking-wider" style={{ color: "#F1F5F9" }}>
            {code}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Save this code to check back anytime on any device. No account or email needed.
          </p>
        </div>
        <button
          type="button"
          onClick={copyCode}
          aria-label={copied ? "Code copied" : "Copy anonymous code"}
          className="btn-press inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-[#4ED8BD]"
          style={{
            background: copied ? "rgba(34,153,130,0.3)" : "rgba(255,255,255,0.08)",
            color: copied ? "#4ED8BD" : "#F1F5F9",
            border: copied ? "1px solid rgba(78,216,189,0.5)" : "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>

      <Label htmlFor="reply">{t("replyLabel")}</Label>
      <Textarea
        id="reply"
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        maxLength={5000}
        rows={4}
        placeholder="Write your reply here..."
      />
      {notice && (
        <p role="alert" className="mt-2 text-sm font-medium" style={{ color: "#F87171" }}>
          {notice}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button variant="primary" onClick={sendReply} disabled={sending || !reply.trim()}>
          {sending ? "Sending..." : t("send")}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
          {t("delete")}
        </Button>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        labelledBy="delete-confirm-title"
        title={t("deleteConfirmTitle")}
        closeLabel={tCommon("cancel")}
      >
        <p className="mt-4 leading-relaxed text-sm" style={{ color: "rgba(226,232,240,0.85)" }}>
          {t("deleteConfirmBody")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            style={{
              border: "1px solid rgba(217,107,88,0.5)",
              background: "rgba(217,107,88,0.12)",
              color: "#D96B58",
            }}
            onClick={deleteThread}
            disabled={deleting}
          >
            {t("deleteYes")}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            {tCommon("cancel")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
