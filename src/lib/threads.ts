import type { Message, ThreadStatus } from "@prisma/client";
import { config } from "./config";
import { prisma } from "./db";
import {
  generateThreadKey,
  hashToken,
  openForThread,
  sealForThread,
  unwrapThreadKey,
  wrapThreadKey,
} from "./crypto";
import { screenForCrisis } from "./screening";
import { generateSeekerCode } from "./token";

export const LOCALES = ["en", "am", "om", "ti"] as const;
export type ContentLanguage = (typeof LOCALES)[number];

export function isContentLanguage(value: unknown): value is ContentLanguage {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export const MAX_MESSAGE_LENGTH = 5000;

export type CreateThreadResult = {
  code: string;
  threadId: string;
  crisisFlagged: boolean;
};

async function prismaCategory(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || !category.active) {
    const err = new Error("CATEGORY_NOT_FOUND") as Error & { code?: string };
    err.code = "CATEGORY_NOT_FOUND";
    throw err;
  }
  return category;
}

export async function createThread(input: {
  content: string;
  categorySlug: string;
  language: ContentLanguage;
}): Promise<CreateThreadResult> {
  const category = await prismaCategory(input.categorySlug);
  const code = generateSeekerCode();
  const tokenHash = hashToken(code);
  const dek = generateThreadKey();
  const sealed = sealForThread(dek, input.content);
  const crisisFlagged = category.isCrisis || screenForCrisis(input.content, input.language);

  await prisma.anonymousSession.create({
    data: {
      tokenHash,
      expiresAt: new Date(Date.now() + config.anonSessionDays * 24 * 60 * 60 * 1000),
      thread: {
        create: {
          categoryId: category.id,
          language: input.language,
          wrappedDek: wrapThreadKey(dek),
          crisisFlags: crisisFlagged
            ? { create: { source: category.isCrisis ? "SEEKER_SELECTION" : "KEYWORD_SCREEN" } }
            : undefined,
          messages: { create: { senderRole: "SEEKER", ...sealed } },
        },
      },
    },
  });

  const created = await prisma.thread.findFirstOrThrow({
    where: { session: { tokenHash } },
    select: { id: true },
  });

  return { code, threadId: created.id, crisisFlagged };
}

export async function getThreadByCode(code: string) {
  const tokenHash = hashToken(code);
  return prisma.thread.findFirst({
    where: { session: { tokenHash } },
    include: {
      category: true,
      session: { select: { id: true, lastSeenAt: true, expiresAt: true } },
      crisisFlags: true,
      claimedBy: { select: { id: true, fullName: true } },
    },
  });
}

export type ThreadWithRelations = NonNullable<Awaited<ReturnType<typeof getThreadByCode>>>;

export type PlainTurn = {
  id: string;
  role: "SEEKER" | "PROFESSIONAL";
  text: string;
  createdAt: Date;
};

export function decryptMessages(wrappedDek: string, messages: Message[]): PlainTurn[] {
  const dek = unwrapThreadKey(wrappedDek);
  return messages.map((m) => ({
    id: m.id,
    role: m.senderRole,
    text: openForThread(dek, {
      ciphertext: m.ciphertext,
      iv: m.iv,
      authTag: m.authTag,
      keyVersion: m.keyVersion,
    }),
    createdAt: m.createdAt,
  }));
}

export async function listMessages(threadId: string): Promise<Message[]> {
  return prisma.message.findMany({ where: { threadId }, orderBy: { createdAt: "asc" } });
}

export async function addMessage(
  thread: { id: string; wrappedDek: string; language: string },
  senderRole: "SEEKER" | "PROFESSIONAL",
  content: string,
): Promise<{ crisisFlagged: boolean }> {
  let crisisFlagged = false;
  if (senderRole === "SEEKER" && screenForCrisis(content, thread.language)) {
    crisisFlagged = true;
    await prisma.crisisFlag.create({ data: { threadId: thread.id, source: "KEYWORD_SCREEN" } });
  }
  const dek = unwrapThreadKey(thread.wrappedDek);
  const sealed = sealForThread(dek, content);
  await prisma.message.create({ data: { threadId: thread.id, senderRole, ...sealed } });
  return { crisisFlagged };
}

export type ClaimResult = "CLAIMED" | "ALREADY_CLAIMED" | "NOT_FOUND";

// Race-safe claim: the conditional updateMany makes exactly one of two
// concurrent claims succeed (single atomic UPDATE ... WHERE claimedById IS
// NULL); the loser sees count 0 and gets a friendly "already claimed" state.
export async function claimThread(threadId: string, professionalId: string): Promise<ClaimResult> {
  const claimed = await prisma.thread.updateMany({
    where: { id: threadId, claimedById: null, status: "OPEN" },
    data: { claimedById: professionalId, claimedAt: new Date(), status: "IN_PROGRESS" },
  });
  if (claimed.count === 1) return "CLAIMED";
  const thread = await prisma.thread.findUnique({ where: { id: threadId }, select: { id: true } });
  return thread ? "ALREADY_CLAIMED" : "NOT_FOUND";
}

export async function setThreadStatus(threadId: string, status: ThreadStatus): Promise<void> {
  await prisma.thread.update({ where: { id: threadId }, data: { status } });
}

export async function flagThreadHighRisk(
  threadId: string,
  professionalId: string,
  reason?: string,
): Promise<void> {
  await prisma.crisisFlag.create({
    data: { threadId, source: "PROFESSIONAL", raisedById: professionalId, reason },
  });
}

// Seeker-initiated "delete my data": removes the session, and by cascade the
// thread, its messages and its flags. The wrapped DEK dies with it.
export async function deleteThreadByCode(code: string): Promise<boolean> {
  const tokenHash = hashToken(code);
  const session = await prisma.anonymousSession.findUnique({
    where: { tokenHash },
    select: { id: true },
  });
  if (!session) return false;
  await prisma.anonymousSession.delete({ where: { id: session.id } });
  return true;
}

export async function touchSession(sessionId: string): Promise<void> {
  await prisma.anonymousSession
    .update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);
}

