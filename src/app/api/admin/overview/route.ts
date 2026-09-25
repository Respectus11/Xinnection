import { handleApiError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);

    const [
      totalThreads,
      openThreads,
      inProgressThreads,
      resolvedThreads,
      escalatedThreads,
      totalMessages,
      totalSessions,
      activeProfessionals,
      pendingProfessionals,
      suspendedProfessionals,
      unresolvedCrisisFlags,
      totalCrisisFlags,
      categories,
      professionals,
      crisisFlags,
      recentThreads,
      auditLogs,
    ] = await Promise.all([
      prisma.thread.count(),
      prisma.thread.count({ where: { status: "OPEN" } }),
      prisma.thread.count({ where: { status: "IN_PROGRESS" } }),
      prisma.thread.count({ where: { status: "RESOLVED" } }),
      prisma.thread.count({ where: { status: "ESCALATED" } }),
      prisma.message.count(),
      prisma.anonymousSession.count(),
      prisma.professional.count({ where: { status: "ACTIVE" } }),
      prisma.professional.count({ where: { status: "PENDING" } }),
      prisma.professional.count({ where: { status: "SUSPENDED" } }),
      prisma.crisisFlag.count({ where: { resolvedAt: null } }),
      prisma.crisisFlag.count(),
      prisma.category.findMany({
        include: {
          _count: {
            select: { threads: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.professional.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          credentials: true,
          licenseNumber: true,
          specialty: true,
          languages: true,
          status: true,
          createdAt: true,
          _count: {
            select: { claimedThreads: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crisisFlag.findMany({
        where: { resolvedAt: null },
        include: {
          thread: {
            include: {
              category: true,
              claimedBy: {
                select: { fullName: true },
              },
            },
          },
        },
        orderBy: { raisedAt: "desc" },
        take: 10,
      }),
      prisma.thread.findMany({
        include: {
          category: true,
          claimedBy: {
            select: { fullName: true },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.auditLogEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return Response.json({
      metrics: {
        totalThreads,
        openThreads,
        inProgressThreads,
        resolvedThreads,
        escalatedThreads,
        totalMessages,
        totalSessions,
        activeProfessionals,
        pendingProfessionals,
        suspendedProfessionals,
        unresolvedCrisisFlags,
        totalCrisisFlags,
      },
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        threadCount: c._count.threads,
        isCrisis: c.isCrisis,
      })),
      professionals,
      crisisFlags,
      recentThreads,
      auditLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
