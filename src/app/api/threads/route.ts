import { errorResponse, handleApiError } from "@/lib/api";
import { clientIpFromHeaders, rateLimit } from "@/lib/rateLimit";
import { MAX_MESSAGE_LENGTH, createThread, isContentLanguage } from "@/lib/threads";

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
    const content = String(body.content ?? "").trim();
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
