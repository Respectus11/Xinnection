import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/api/health/route';
import { prisma } from '../../src/lib/db';
import { redis } from '../../src/lib/redis';

vi.mock('../../src/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock('../../src/lib/redis', () => ({
  redis: {
    ping: vi.fn(),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and status "ok" when all services are healthy', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }] as never);
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG' as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'ok',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    });
  });

  it('returns 503 and status "degraded" when database fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('DB unreachable'));
    vi.mocked(redis.ping).mockResolvedValueOnce('PONG' as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'degraded',
      checks: {
        database: 'unavailable',
        redis: 'ok',
      },
    });
  });

  it('returns 503 and status "degraded" when redis fails', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }] as never);
    vi.mocked(redis.ping).mockRejectedValueOnce(new Error('Redis connection refused'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'degraded',
      checks: {
        database: 'ok',
        redis: 'unavailable',
      },
    });
  });
});
