import { prisma } from "./db";

// Enforces the retention promise: anonymous sessions past `expiresAt` are
// deleted in bounded batches. The database cascade removes each session's
// threads, messages, crisis flags — and crucially the wrapped DEK — so any
// ciphertext copies still sitting in backups become unreadable once the key
// row dies. Batches keep a single invocation short regardless of backlog.
const MAX_BATCHES_PER_RUN = 50;

export async function purgeExpiredSessions(batchSize = 100): Promise<number> {
  let deleted = 0;
  for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch++) {
    const expired = await prisma.anonymousSession.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { id: true },
      take: batchSize,
    });
    if (expired.length === 0) break;
    const result = await prisma.anonymousSession.deleteMany({
      where: { id: { in: expired.map((session) => session.id) } },
    });
    deleted += result.count;
    if (expired.length < batchSize) break;
  }
  return deleted;
}
