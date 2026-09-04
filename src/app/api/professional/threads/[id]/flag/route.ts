import { handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { flagThreadHighRisk } from "@/lib/threads";

// Flag as high risk: an internal clinical/admin signal. It surfaces the case
// in the admin oversight view but does NOT change anything the seeker sees.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireRole(["PROFESSIONAL"]);

    let body: { reason?: string };
    let reason: string | undefined;
    try {
      body = await request.json();
      reason = body.reason ? String(body.reason).trim().slice(0, 500) : undefined;
    } catch {
      reason = undefined;
    }

    await flagThreadHighRisk(id, session.sub, reason || undefined);
    await writeAudit({
      actorType: "PROFESSIONAL",
      actorId: session.sub,
      action: "thread.flag",
      targetType: "thread",
      targetId: id,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
