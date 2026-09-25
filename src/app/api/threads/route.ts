import { errorResponse, handleApiError } from "@/lib/api";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { MAX_MESSAGE_LENGTH, createThread, isContentLanguage } from "@/lib/threads";
import DOMPurify from "isomorphic-dompurify";

// Anonymous submission. No account, no identity: the response carries the
// one-time code the seeker must save. Raw code is never stored — only its
// peppered hash (see lib/crypto.ts).
export async function POST(request: Request) {
  try {
    let body: { content?: string; categorySlug?: string; language?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST");
    }
    const contentRaw = String(body.content ?? "").trim();
    const content = DOMPurify.sanitize(contentRaw, { ALLOWED_TAGS: [] }); // Strip ALL HTML tags
    const categorySlug = String(body.categorySlug ?? "");
    const language = body.language;
    if (!content || content.length > MAX_MESSAGE_LENGTH || !categorySlug) {
      return errorResponse(400, "INVALID");
    }
    if (!isContentLanguage(language)) return errorResponse(400, "INVALID");

    const rl = await rateLimit("thread-submit", clientIpFromHeaders(request.headers), 5, 3600);
    if (!rl.ok) return errorResponse(429, "RATE_LIMITED");

    const result = await createThread({ content, categorySlug, language });
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
    const { getSession } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/db");
    const session = await getSession();
    if (!session || (session.role !== "PROFESSIONAL" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return errorResponse(401, "UNAUTHENTICATED");
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusParam && ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"].includes(statusParam)) {
      where.status = statusParam;
    } else {
      where.status = { in: ["OPEN", "IN_PROGRESS", "ESCALATED"] };
    }

    const threads = await prisma.thread.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        category: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return Response.json(threads);
  } catch (error) {
    return handleApiError(error);
  }
}
