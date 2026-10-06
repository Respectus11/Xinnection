import type { Message } from "@prisma/client";
import { decryptMessages } from "./threads";

// Explicit allowlist responses. Never spread DB rows into a response: rows
// carry wrappedDek, tokenHash, IVs and auth tags that clients must never see.
//
// `ciphertext` is kept as an alias of `text` because the existing UI reads the
// plaintext from `msg.ciphertext`; it contains PLAINTEXT, never real ciphertext.

type ThreadRow = {
  id: string;
  status: string;
  language: string;
  claimedById: string | null;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  wrappedDek: string;
  category?: { id: string; slug: string; isCrisis: boolean } | null;
  messages: Message[];
};

export function toThreadDto(thread: ThreadRow) {
  const turns = decryptMessages(thread.id, thread.wrappedDek, thread.messages);
  return {
    id: thread.id,
    status: thread.status,
    language: thread.language,
    claimedById: thread.claimedById,
    claimedAt: thread.claimedAt,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    category: thread.category
      ? { id: thread.category.id, slug: thread.category.slug, isCrisis: thread.category.isCrisis }
      : undefined,
    messages: turns.map((t, i) => ({
      id: t.id,
      threadId: thread.id,
      senderRole: t.role,
      text: t.text,
      ciphertext: t.text,
      createdAt: thread.messages[i].createdAt,
    })),
  };
}
