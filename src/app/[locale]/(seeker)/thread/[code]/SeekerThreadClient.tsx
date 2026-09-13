"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Label, Textarea } from "@/components/ui/fields";

// Seeker-side thread controls: adding a turn (proven by the anonymous code)
// and the no-friction "delete my data" action with a plain-language confirm
// dialog. The quiet 20s refresh works everywhere, including flaky networks;
// new replies reach the visitor through the ThreadLine's extend motion.
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
    return <p className="card p-6 leading-relaxed text-ink/85">{t("deleted")}</p>;
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
      />
      {notice && (
        <p role="alert" className="mt-2 text-flag">
          {notice}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button variant="primary" onClick={sendReply} disabled={sending || !reply.trim()}>
          {t("send")}
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
        <p className="mt-4 leading-relaxed text-ink/85">{t("deleteConfirmBody")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="border-flag/50 bg-white text-flag hover:border-flag hover:bg-flag/5"
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
