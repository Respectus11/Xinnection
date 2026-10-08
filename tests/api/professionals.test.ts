import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/api/professionals/route';
import { prisma } from '../../src/lib/db';

vi.mock('../../src/lib/db', () => ({
  prisma: {
    professional: {
      findMany: vi.fn(),
    },
  },
}));

describe('GET /api/professionals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only safe fields of ACTIVE professionals', async () => {
    const mockPros = [
      {
        id: 'pro1',
        fullName: 'Jane Doe',
        specialty: 'Trauma',
        languages: ['en'],
        bio: 'Hello',
        photoUrl: null,
      },
    ];

    // @ts-ignore
    prisma.professional.findMany.mockResolvedValueOnce(mockPros);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPros);
    expect(prisma.professional.findMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        languages: true,
        bio: true,
        photoUrl: true,
      },
      orderBy: { fullName: 'asc' },
    });
    
    // Check Cache-Control headers
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60, stale-while-revalidate=120');
  });

  it('returns 500 on database error', async () => {
    // @ts-ignore
    prisma.professional.findMany.mockRejectedValueOnce(new Error('DB connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'SERVER_ERROR' });
  });
});
