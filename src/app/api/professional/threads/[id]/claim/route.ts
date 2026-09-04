import { errorResponse, handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { claimThread } from "@/lib/threads";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["PROFESSIONAL"]);

    const professional = await prisma.professional.findUnique({
      where: { id: session.sub },
      select: { status: true },
    });
    if (!professional || professional.status !== "ACTIVE") {
      return errorResponse(403, "PROFESSIONAL_INACTIVE");
    }

    const result = await claimThread(id, session.sub);
    if (result === "NOT_FOUND") return errorResponse(404, "NOT_FOUND");
    if (result === "ALREADY_CLAIMED") return errorResponse(409, "ALREADY_CLAIMED");

    await writeAudit({
      actorType: "PROFESSIONAL",
      actorId: session.sub,
      action: "thread.claim",
      targetType: "thread",
      targetId: id,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
