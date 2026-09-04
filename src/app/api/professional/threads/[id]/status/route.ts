import { errorResponse, handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { setThreadStatus } from "@/lib/threads";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["PROFESSIONAL"]);

    let body: { status?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const status = String(body.status ?? "");
    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      return errorResponse(400, "INVALID");
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { id: true, claimedById: true, status: true },
    });
    if (!thread) return errorResponse(404, "NOT_FOUND");
    if (thread.claimedById !== session.sub) return errorResponse(403, "FORBIDDEN");

    await setThreadStatus(id, status as (typeof VALID_STATUSES)[number]);
    await writeAudit({
      actorType: "PROFESSIONAL",
      actorId: session.sub,
      action: "thread.status",
      targetType: "thread",
      targetId: id,
      metadata: { from: thread.status, to: status },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
