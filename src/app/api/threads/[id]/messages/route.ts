import { ApiError, requireActiveProfessional } from "@/lib/auth";
import { errorResponse, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { hashToken, tokenHashesEqual, unwrapThreadKey, openForThread } from "@/lib/crypto";
import { assertCodeAttemptAllowed, recordBadCode } from "@/lib/codeLookup";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import {
  MAX_MESSAGE_LENGTH,
  addMessage,
  claimThread,
  touchSession,
} from "@/lib/threads";
import { sanitizePlainText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// Adds a turn to a conversation. Two credential paths:
// - seeker: proves ownership with their code (hash-compared)
// - professional: authenticated, ACTIVE session, must be the claiming professional
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let body: { content?: string; code?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const content = sanitizePlainText(String(body.content ?? ""));
    if (!content || content.length > MAX_MESSAGE_LENGTH) return errorResponse(400, "INVALID");

    const providedCode = String(body.code ?? "").trim();
    let senderRole: "SEEKER" | "PROFESSIONAL";
    let professionalId: string | null = null;

    if (providedCode) {
      // Guess-throttle and message-rate-limit run BEFORE any DB work.
      await assertCodeAttemptAllowed(request.headers);
      if (providedCode.length > 128) return errorResponse(400, "BAD_REQUEST");
      const rl = await rateLimit("thread-message", clientIpFromHeaders(request.headers), 20, 3600);
      if (!rl.ok) return errorResponse(429, "RATE_LIMITED");
      senderRole = "SEEKER";
    } else {
      const session = await requireActiveProfessional();
      professionalId = session.sub;
      senderRole = "PROFESSIONAL";
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: { session: { select: { id: true, tokenHash: true } } },
    });

    if (senderRole === "SEEKER") {
      if (!thread || !tokenHashesEqual(hashToken(providedCode), thread.session.tokenHash)) {
        await recordBadCode(request.headers);
        return errorResponse(404, "NOT_FOUND");
      }

      // Anti-spam cooldown and consecutive-duplicate check between seeker messages.
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
            { status: 429 },
          );
        }

        try {
          const dek = unwrapThreadKey(thread.wrappedDek);
          const lastText = openForThread(
            dek,
            {
              ciphertext: lastSeekerMessage.ciphertext,
              iv: lastSeekerMessage.iv,
              authTag: lastSeekerMessage.authTag,
              keyVersion: lastSeekerMessage.keyVersion,
            },
            thread.id,
          );
          if (lastText.trim().toLowerCase() === content.trim().toLowerCase()) {
            return Response.json(
              {
                error: "DUPLICATE",
                message: "You already shared this reflection. Please give your companion time to respond.",
              },
              { status: 400 },
            );
          }
        } catch {
          // non-fatal if decryption fails during duplicate check
        }
      }
    } else {
      if (!thread) return errorResponse(404, "NOT_FOUND");
      if (!thread.claimedById) {
        // Atomic claim: only one professional can win a race for an open thread.
        const result = await claimThread(thread.id, professionalId!);
        if (result === "ALREADY_CLAIMED") {
          const fresh = await prisma.thread.findUnique({ where: { id }, select: { claimedById: true } });
          if (fresh?.claimedById !== professionalId) throw new ApiError(403, "FORBIDDEN");
        } else if (result === "NOT_FOUND") {
          return errorResponse(404, "NOT_FOUND");
        }
      } else if (thread.claimedById !== professionalId) {
        return errorResponse(403, "FORBIDDEN");
      }
    }

    const result = await addMessage(
      { id: thread!.id, wrappedDek: thread!.wrappedDek, language: thread!.language },
      senderRole,
      content,
    );
    if (senderRole === "SEEKER") await touchSession(thread!.session.id);
    return Response.json({ ok: true, crisisFlagged: result.crisisFlagged });
  } catch (error) {
    return handleApiError(error);
  }
}
