import { errorResponse, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    
    if (!code) {
      return errorResponse(400, "BAD_REQUEST");
    }

    const tokenHash = hashToken(code);

    const anonymousSession = await prisma.anonymousSession.findUnique({
      where: { tokenHash },
      include: {
        thread: {
          include: {
            messages: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!anonymousSession || !anonymousSession.thread) {
      return errorResponse(404, "NOT_FOUND");
    }

    return Response.json(anonymousSession.thread);
  } catch (error) {
    return handleApiError(error);
  }
}
