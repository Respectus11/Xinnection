import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as logoutPost } from '../../src/app/api/auth/logout/route';
import { POST as loginPost } from '../../src/app/api/auth/login/route';
import * as auth from '../../src/lib/auth';

vi.mock('../../src/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof auth>();
  return {
    ...actual,
    revokeCurrentSession: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/logout', () => {
    it('revokes current session and returns { ok: true }', async () => {
      const response = await logoutPost();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      expect(auth.revokeCurrentSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects invalid JSON request body with 400 BAD_REQUEST', async () => {
      const badRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json',
      });

      const response = await loginPost(badRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'BAD_REQUEST' });
    });

    it('rejects missing email or password with 400 BAD_REQUEST', async () => {
      const req = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      });

      const response = await loginPost(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'BAD_REQUEST' });
    });
  });
});
