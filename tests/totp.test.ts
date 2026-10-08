import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as OTPAuth from 'otpauth';
import { verifyTotp } from '../src/lib/totp';
import { wrapSecret } from '../src/lib/crypto';
import { redis } from '../src/lib/redis';

// Mock Redis to prevent real connection in tests
vi.mock('../src/lib/redis', () => ({
  redis: {
    set: vi.fn(),
  },
}));

describe('TOTP Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MSG_KEY_V1 = Buffer.alloc(32, 'a').toString('base64');
  });

  it('rejects malformed tokens', async () => {
    const secret = OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP').base32;
    const wrapped = wrapSecret(secret);
    
    expect(await verifyTotp('user1', wrapped, '12345')).toBe(false);
    expect(await verifyTotp('user1', wrapped, '1234567')).toBe(false);
    expect(await verifyTotp('user1', wrapped, 'abcdef')).toBe(false);
  });

  it('validates a correct token and marks it as used', async () => {
    const secret = OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP').base32;
    const wrapped = wrapSecret(secret);
    
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    const token = totp.generate();
    
    // @ts-ignore
    redis.set.mockResolvedValueOnce('OK');
    
    const result = await verifyTotp('user1', wrapped, token);
    expect(result).toBe(true);
    expect(redis.set).toHaveBeenCalledWith(`totp-used:user1:${token}`, '1', 'EX', 120, 'NX');
  });

  it('rejects a replayed token', async () => {
    const secret = OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP').base32;
    const wrapped = wrapSecret(secret);
    
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    const token = totp.generate();
    
    // Simulate redis rejecting the SET NX because it already exists
    // @ts-ignore
    redis.set.mockResolvedValueOnce(null);
    
    const result = await verifyTotp('user1', wrapped, token);
    expect(result).toBe(false);
  });
});
