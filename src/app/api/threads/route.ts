import { errorResponse, handleApiError } from "@/lib/api";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { MAX_MESSAGE_LENGTH, createThread, isContentLanguage } from "@/lib/threads";
import { sanitizePlainText } from "@/lib/sanitize";

// Anonymous submission. No account, no identity: the response carries the
// one-time code the seeker must save. Raw code is never stored — only its
// peppered hash (see lib/crypto.ts).
export async function POST(request: Request) {
  try {
    let body: { content?: string; categorySlug?: string; language?: string; preferredProfessionalId?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const content = sanitizePlainText(String(body.content ?? ""));
    const categorySlug = String(body.categorySlug ?? "");
    const language = body.language;
    // Optional: seeker may have selected a specific professional from the directory.
    // Stored for informational purposes — does not bypass security or auto-claim.
    const preferredProfessionalId =
      body.preferredProfessionalId && typeof body.preferredProfessionalId === "string"
        ? body.preferredProfessionalId.trim().slice(0, 64)
        : undefined;

    if (!content || content.length > MAX_MESSAGE_LENGTH || !categorySlug) {
      return errorResponse(400, "INVALID");
    }
    if (!isContentLanguage(language)) return errorResponse(400, "INVALID");

    const rl = await rateLimit("thread-submit", clientIpFromHeaders(request.headers), 5, 3600);
    if (!rl.ok) return errorResponse(429, "RATE_LIMITED");

    const result = await createThread({ content, categorySlug, language, preferredProfessionalId });
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return errorResponse(400, "INVALID");
    }
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const { requireRole } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/db");
    await requireRole(["PROFESSIONAL", "ADMIN", "SUPER_ADMIN"]);

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"] as const;
    type Status = (typeof statuses)[number];
    const where: { status: Status | { in: Status[] } } =
      statusParam && (statuses as readonly string[]).includes(statusParam)
        ? { status: statusParam as Status }
        : { status: { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] } };

    // Explicit select: never return wrappedDek, session/token data or message
    // ciphertext in a list response.
    const threads = await prisma.thread.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        language: true,
        claimedById: true,
        claimedAt: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, slug: true, isCrisis: true } },
      },
    });

    return Response.json(threads, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
