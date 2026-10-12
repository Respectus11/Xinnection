import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assertCodeAttemptAllowed, recordBadCode } from '../src/lib/codeLookup';
import * as rateLimit from '../src/lib/rateLimit';
import { ApiError } from '../src/lib/auth';

vi.mock('../src/lib/rateLimit', () => ({
  isBlocked: vi.fn(),
  recordFailure: vi.fn(),
  clientIpFromHeaders: vi.fn(() => '127.0.0.1'),
}));

describe('codeLookup anti-brute force', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows attempt when not blocked', async () => {
    vi.mocked(rateLimit.isBlocked).mockResolvedValueOnce({ ok: true, retryAfterSec: 0 });
    await expect(assertCodeAttemptAllowed(new Headers())).resolves.toBeUndefined();
    expect(rateLimit.isBlocked).toHaveBeenCalledWith('code-guess', '127.0.0.1', 10);
  });

  it('throws RATE_LIMITED when blocked', async () => {
    vi.mocked(rateLimit.isBlocked).mockResolvedValueOnce({ ok: false, retryAfterSec: 60 });
    await expect(assertCodeAttemptAllowed(new Headers())).rejects.toThrowError(ApiError);
  });

  it('records failure', async () => {
    await recordBadCode(new Headers());
    expect(rateLimit.recordFailure).toHaveBeenCalledWith('code-guess', '127.0.0.1', 15 * 60);
  });
});
