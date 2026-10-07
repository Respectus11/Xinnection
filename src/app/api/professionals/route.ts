import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public professional directory.
// Only ACTIVE professionals are returned; only safe display fields are selected.
// No email, passwordHash, totpSecretEnc, licenseNumber, or credentials is ever
// included — this endpoint is intentionally unauthenticated because seekers are
// fully anonymous and cannot log in.
export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        languages: true,
        bio: true,
        photoUrl: true,
      },
      orderBy: { fullName: "asc" },
    });

    return Response.json(professionals, {
      headers: {
        // Cache for 60 s at the CDN edge; stale-while-revalidate means the next
        // request still gets a fast response while the cache refreshes.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
