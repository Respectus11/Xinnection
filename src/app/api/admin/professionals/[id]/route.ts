import { errorResponse, handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { notifier } from "@/lib/notify";
import { prisma } from "@/lib/db";

// Admin professional management: approve / reject (onboarding), suspend
// (reason required) / reinstate. Every branch writes an audit entry.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);

    let body: { action?: string; reason?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const action = String(body.action ?? "");
    const reason = String(body.reason ?? "").trim();

    const professional = await prisma.professional.findUnique({ where: { id } });
    if (!professional) return errorResponse(404, "NOT_FOUND");

    switch (action) {
      case "approve": {
        if (professional.status !== "PENDING") return errorResponse(409, "INVALID_STATE");
        await prisma.professional.update({ where: { id }, data: { status: "ACTIVE" } });
        // Staff notification behind a driver interface — the audited approve
        // flow stays untouched when a real provider is wired in.
        await notifier.professionalApproved({
          id: professional.id,
          email: professional.email,
          fullName: professional.fullName,
        });
        await writeAudit({
          actorType: "ADMIN",
          actorId: session.sub,
          action: "professional.approve",
          targetType: "professional",
          targetId: id,
        });
        break;
      }
      case "reject": {
        if (professional.status !== "PENDING") return errorResponse(409, "INVALID_STATE");
        if (!reason) return errorResponse(400, "REASON_REQUIRED");
        await prisma.professional.delete({ where: { id } });
        await writeAudit({
          actorType: "ADMIN",
          actorId: session.sub,
          action: "professional.reject",
          targetType: "professional",
          targetId: id,
          metadata: { reason },
        });
        break;
      }
      case "suspend": {
        if (professional.status !== "ACTIVE") return errorResponse(409, "INVALID_STATE");
        if (!reason) return errorResponse(400, "REASON_REQUIRED");
        await prisma.professional.update({ where: { id }, data: { status: "SUSPENDED" } });
        await writeAudit({
          actorType: "ADMIN",
          actorId: session.sub,
          action: "professional.suspend",
          targetType: "professional",
          targetId: id,
          metadata: { reason },
        });
        break;
      }
      case "reinstate": {
        if (professional.status !== "SUSPENDED") return errorResponse(409, "INVALID_STATE");
        await prisma.professional.update({ where: { id }, data: { status: "ACTIVE" } });
        await writeAudit({
          actorType: "ADMIN",
          actorId: session.sub,
          action: "professional.reinstate",
          targetType: "professional",
          targetId: id,
        });
        break;
      }
      default:
        return errorResponse(400, "INVALID");
    }

    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
