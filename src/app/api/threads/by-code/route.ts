import { errorResponse, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawCode = url.searchParams.get("code");
    
    if (!rawCode) {
      return errorResponse(400, "BAD_REQUEST");
    }

    const code = decodeURIComponent(rawCode).trim();
    const tokenHash = hashToken(code);

    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { tokenHash },
      include: {
        thread: {
          include: {
            category: true,
            messages: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!anonymousSession || !anonymousSession.thread) {
      return errorResponse(404, "NOT_FOUND");
    }

    const { thread } = anonymousSession;
    const { decryptMessages } = await import("@/lib/threads");
    const plainTurns = decryptMessages(thread.wrappedDek, thread.messages);

    const decryptedThread = {
      ...thread,
      messages: thread.messages.map((m, idx) => ({
        ...m,
        ciphertext: plainTurns[idx]?.text || m.ciphertext,
        text: plainTurns[idx]?.text || m.ciphertext,
      })),
    };

    return Response.json(decryptedThread);
  } catch (error) {
    return handleApiError(error);
  }
}
