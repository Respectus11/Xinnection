"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/fields";

// Seeker-side thread controls: adding a turn (proven by the anonymous code)
// and the no-friction "delete my data" action with a plain-language confirm.
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

  // Quiet auto-refresh of the server-rendered thread — a poor-man's realtime
  // that works everywhere, including flaky 2G connections.
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), 20000);
    return () => window.clearInterval(id);
  }, [router]);

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
      if (res.ok) setDeleted(true);
      else setNotice(tCommon("errorGeneric"));
    } catch {
      setNotice(tCommon("errorGeneric"));
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return <p className="border border-line bg-white p-4">{t("deleted")}</p>;
  }

  return (
    <div className="mt-12 border-t border-line pt-8">
      <Label htmlFor="reply">{t("replyLabel")}</Label>
      <Textarea
        id="reply"
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
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={sendReply} disabled={sending || !reply.trim()}>
          {t("send")}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
          {t("delete")}
        </Button>
      </div>

      {confirmDelete && (
        <div
          role="alertdialog"
          aria-label={t("deleteConfirmTitle")}
          className="mt-4 border border-line bg-white p-4"
        >
          <p className="font-semibold">{t("deleteConfirmTitle")}</p>
          <p className="mt-1 text-ink/80">{t("deleteConfirmBody")}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="primary" onClick={deleteThread} disabled={deleting}>
              {t("deleteYes")}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
