import { ApiError, requireActiveProfessional } from "@/lib/auth";
import { errorResponse, handleApiError } from "@/lib/api";
import { deleteThreadByCode, setThreadStatus } from "@/lib/threads";
import { prisma } from "@/lib/db";
import { hashToken, tokenHashesEqual } from "@/lib/crypto";
import { assertCodeAttemptAllowed, recordBadCode } from "@/lib/codeLookup";
import { writeAudit } from "@/lib/audit";
import { toThreadDto } from "@/lib/dto";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"] as const;

// "Delete my data": the code in the body IS the credential. Deleting removes
// the session and, by cascade, the thread, its messages and flags — and the
// wrapped per-thread key dies with them.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertCodeAttemptAllowed(request.headers);
    const { id } = await params;
    let body: { code?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const code = String(body.code ?? "").trim();
    if (!code || code.length > 128) return errorResponse(400, "BAD_REQUEST");

    // The code must own THIS thread: the path id and the code are both checked,
    // so a leaked/guessed id can never be paired with an unrelated code.
    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { session: { select: { tokenHash: true } } },
    });
    if (!thread || !tokenHashesEqual(hashToken(code), thread.session.tokenHash)) {
      await recordBadCode(request.headers);
      return errorResponse(404, "NOT_FOUND");
    }

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
    const code = (url.searchParams.get("code") ?? "").trim();

    const include = {
      category: true,
      session: { select: { tokenHash: true } },
      messages: { orderBy: { createdAt: "asc" as const } },
    };

    if (code) {
      await assertCodeAttemptAllowed(request.headers);
      if (code.length > 128) return errorResponse(400, "BAD_REQUEST");
      const thread = await prisma.thread.findUnique({ where: { id }, include });
      if (!thread || !tokenHashesEqual(hashToken(code), thread.session.tokenHash)) {
        await recordBadCode(request.headers);
        return errorResponse(404, "NOT_FOUND");
      }
      return Response.json(toThreadDto(thread), { headers: NO_STORE });
    }

    // Professional path: must be an ACTIVE professional, and may read only
    // threads that are unclaimed (triage) or claimed by themselves.
    const session = await requireActiveProfessional();
    const thread = await prisma.thread.findUnique({ where: { id }, include });
    if (!thread) return errorResponse(404, "NOT_FOUND");
    if (thread.claimedById && thread.claimedById !== session.sub) {
      return errorResponse(403, "FORBIDDEN");
    }
    return Response.json(toThreadDto(thread), { headers: NO_STORE });
  } catch (error) {
    return handleApiError(error);
  }
}

// Status change by the claiming professional only (same rules as
// /api/professional/threads/[id]/status). Kept for UI compatibility.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireActiveProfessional();

    let body: { status?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const status = String(body.status ?? "");
    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      return errorResponse(400, "BAD_REQUEST");
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { id: true, claimedById: true, status: true },
    });
    if (!thread) return errorResponse(404, "NOT_FOUND");
    if (thread.claimedById !== session.sub) throw new ApiError(403, "FORBIDDEN");

    await setThreadStatus(id, status as (typeof VALID_STATUSES)[number]);
    await writeAudit({
      actorType: "PROFESSIONAL",
      actorId: session.sub,
      action: "thread.status",
      targetType: "thread",
      targetId: id,
      metadata: { from: thread.status, to: status },
    });
    return Response.json({ ok: true, status });
  } catch (error) {
    return handleApiError(error);
  }
}
