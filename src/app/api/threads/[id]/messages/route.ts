import { errorResponse, handleApiError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import {
  MAX_MESSAGE_LENGTH,
  addMessage,
  touchSession,
} from "@/lib/threads";
import { sanitizePlainText } from "@/lib/sanitize";

// Adds a turn to a conversation. Two credential paths:
// - seeker: proves ownership with their code (hash-compared)
// - professional: authenticated session, must be the claiming professional
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let body: { content?: string; code?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const contentRaw = String(body.content ?? "").trim();
    const content = sanitizePlainText(contentRaw); // Strip ALL HTML tags
    if (!content || content.length > MAX_MESSAGE_LENGTH) return errorResponse(400, "INVALID");

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: { session: { select: { id: true, tokenHash: true } } },
    });
    if (!thread) return errorResponse(404, "NOT_FOUND");

    let senderRole: "SEEKER" | "PROFESSIONAL";
    const providedCode = String(body.code ?? "");
    if (providedCode) {
      if (hashToken(providedCode) !== thread.session.tokenHash) {
        return errorResponse(403, "FORBIDDEN");
      }
      senderRole = "SEEKER";

      // Enforce 40-second anti-spam cooldown and duplicate check between seeker messages
      const lastSeekerMessage = await prisma.message.findFirst({
        where: { threadId: thread.id, senderRole: "SEEKER" },
        orderBy: { createdAt: "desc" },
      });

      if (lastSeekerMessage) {
        const elapsedSec = (Date.now() - new Date(lastSeekerMessage.createdAt).getTime()) / 1000;
        if (elapsedSec < 40) {
          const retryAfter = Math.ceil(40 - elapsedSec);
          return Response.json(
            {
              error: "COOLDOWN",
              message: `Please pause and reflect. You can send another message in ${retryAfter} seconds.`,
              retryAfter,
            },
            { status: 429 }
          );
        }

        // Check for consecutive identical duplicate message
        const { unwrapThreadKey, openForThread } = await import("@/lib/crypto");
        try {
          const dek = unwrapThreadKey(thread.wrappedDek);
          const lastText = openForThread(dek, {
            ciphertext: lastSeekerMessage.ciphertext,
            iv: lastSeekerMessage.iv,
            authTag: lastSeekerMessage.authTag,
            keyVersion: lastSeekerMessage.keyVersion,
          });
          if (lastText.trim().toLowerCase() === content.trim().toLowerCase()) {
            return Response.json(
              {
                error: "DUPLICATE",
                message: "You already shared this reflection. Please give your companion time to respond.",
              },
              { status: 400 }
            );
          }
        } catch {
          // non-fatal if decryption fails during duplicate check
        }
      }

      const rl = await rateLimit("thread-message", clientIpFromHeaders(request.headers), 20, 3600);
      if (!rl.ok) return errorResponse(429, "RATE_LIMITED");
    } else {
      const session = await getSession();
      if (!session || session.role !== "PROFESSIONAL") return errorResponse(401, "UNAUTHENTICATED");
      if (!thread.claimedById) {
        await prisma.thread.update({
          where: { id: thread.id },
          data: { claimedById: session.sub, claimedAt: new Date(), status: "IN_PROGRESS" },
        });
      } else if (thread.claimedById !== session.sub) {
        return errorResponse(403, "FORBIDDEN");
      }
      senderRole = "PROFESSIONAL";
    }

    const result = await addMessage(
      { id: thread.id, wrappedDek: thread.wrappedDek, language: thread.language },
      senderRole,
      content,
    );
    if (senderRole === "SEEKER") await touchSession(thread.session.id);
    return Response.json({ ok: true, crisisFlagged: result.crisisFlagged });
  } catch (error) {
    return handleApiError(error);
  }
}
