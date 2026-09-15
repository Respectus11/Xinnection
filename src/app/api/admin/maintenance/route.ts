import crypto from "node:crypto";
import { errorResponse, handleApiError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { config } from "@/lib/config";
import { purgeExpiredSessions } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

// Retention endpoint for a scheduled job (cron / platform scheduler). Two
// credential paths: a SUPER_ADMIN session, or a shared secret header for the
// scheduler so automation needs no staff account. Timing-safe comparison;
// the response carries counts only — never any conversation data.
function secretMatches(candidate: string | null): boolean {
  if (!config.maintenanceSecret || !candidate) return false;
  const a = crypto.createHash("sha256").update(candidate).digest();
  const b = crypto.createHash("sha256").update(config.maintenanceSecret).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const authorized =
      secretMatches(request.headers.get("x-maintenance-secret")) ||
      session?.role === "SUPER_ADMIN";
    if (!authorized) return errorResponse(401, "UNAUTHENTICATED");

    const deleted = await purgeExpiredSessions();
    await writeAudit({
      actorType: "SYSTEM",
      actorId: session?.sub ?? "scheduler",
      action: "maintenance.purge",
      targetType: "anonymousSession",
      targetId: "*",
      metadata: { deleted },
    });
    return Response.json({ ok: true, deleted });
  } catch (error) {
    return handleApiError(error);
  }
}
