import { errorResponse, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { assertCodeAttemptAllowed, recordBadCode } from "@/lib/codeLookup";
import { toThreadDto } from "@/lib/dto";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    await assertCodeAttemptAllowed(request.headers);

    const url = new URL(request.url);
    // searchParams is already percent-decoded; decoding again would corrupt
    // codes and can throw on malformed input.
    const code = (url.searchParams.get("code") ?? "").trim();
    if (!code || code.length > 128) return errorResponse(400, "BAD_REQUEST");

    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { tokenHash: hashToken(code) },
      include: {
        thread: {
          include: {
            category: true,
            messages: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!anonymousSession || !anonymousSession.thread) {
      await recordBadCode(request.headers);
      return errorResponse(404, "NOT_FOUND");
    }

    return Response.json(toThreadDto(anonymousSession.thread), { headers: NO_STORE });
  } catch (error) {
    return handleApiError(error);
  }
}
