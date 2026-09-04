import { errorResponse, handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

// Mark a high-risk flag reviewed (the safety-net oversight action).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);

    const flag = await prisma.crisisFlag.findUnique({ where: { id } });
    if (!flag) return errorResponse(404, "NOT_FOUND");
    if (flag.resolvedAt) return errorResponse(409, "ALREADY_RESOLVED");

    await prisma.crisisFlag.update({
      where: { id },
      data: { resolvedAt: new Date(), resolvedById: session.sub },
    });
    await writeAudit({
      actorType: "ADMIN",
      actorId: session.sub,
      action: "flag.resolve",
      targetType: "crisis_flag",
      targetId: id,
      metadata: { threadId: flag.threadId },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
