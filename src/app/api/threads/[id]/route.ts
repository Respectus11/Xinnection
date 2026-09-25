import { errorResponse, handleApiError } from "@/lib/api";
import { deleteThreadByCode } from "@/lib/threads";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { getSession } from "@/lib/auth";

// "Delete my data": the code in the body IS the credential. Deleting removes
// the session and, by cascade, the thread, its messages and flags — and the
// wrapped per-thread key dies with them.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // The code in the body is the credential — the id path segment is not
    // used for lookup, so a valid code can only ever delete its own thread.
    await params;
    let body: { code?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const code = String(body.code ?? "");
    if (!code) return errorResponse(400, "BAD_REQUEST");

    const deleted = await deleteThreadByCode(code);
    if (!deleted) return errorResponse(404, "NOT_FOUND");
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        session: { select: { id: true, tokenHash: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!thread) return errorResponse(404, "NOT_FOUND");

    if (code) {
      if (hashToken(code) !== thread.session.tokenHash) {
        return errorResponse(403, "FORBIDDEN");
      }
    } else {
      const session = await getSession();
      if (!session || session.role !== "PROFESSIONAL") {
        return errorResponse(401, "UNAUTHENTICATED");
      }
    }

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
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "PROFESSIONAL") {
      return errorResponse(401, "UNAUTHENTICATED");
    }

    let body: { status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED" };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }

    const { status } = body;
    if (!status || !["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"].includes(status)) {
      return errorResponse(400, "BAD_REQUEST");
    }

    const updated = await prisma.thread.update({
      where: { id },
      data: { status },
    });

    return Response.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
