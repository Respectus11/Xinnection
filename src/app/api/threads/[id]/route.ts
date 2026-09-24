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

    return Response.json(thread);
  } catch (error) {
    return handleApiError(error);
  }
}

