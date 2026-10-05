import { describe, expect, it } from "vitest";
import { sanitizePlainText } from "@/lib/sanitize";
import { resolveClientIp } from "@/lib/clientIp";

describe("security utilities", () => {
  describe("sanitizePlainText", () => {
    it("strips NUL bytes and control characters while preserving newlines", () => {
      const raw = "Hello\x00 world!\x1F\nThis is a line.\tTabbed.";
      const cleaned = sanitizePlainText(raw);
      expect(cleaned).toBe("Hello world!\nThis is a line.\tTabbed.");
    });

    it("strips bidi overrides and zero-width spoofing characters", () => {
      const spoof = "Safe\u202Ereversed\u202C text with\u200B zero-width space";
      const cleaned = sanitizePlainText(spoof);
      expect(cleaned).toBe("Safereversed text with zero-width space");
    });

    it("normalizes unicode to NFC", () => {
      const decomposed = "e\u0301"; // e + acute accent
      const cleaned = sanitizePlainText(decomposed);
      expect(cleaned).toBe("é");
    });
  });

  describe("resolveClientIp", () => {
    it("prefers platform-authenticated headers (Vercel/Cloudflare)", () => {
      const headers = new Headers({
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
        "x-vercel-forwarded-for": "198.51.100.25",
      });
      expect(resolveClientIp(headers)).toBe("198.51.100.25");
    });

    it("selects the trusted hop from the right of X-Forwarded-For to defeat spoofing", () => {
      // Attacker sends: X-Forwarded-For: 127.0.0.1, 10.0.0.1, RealClientIP
      // With 1 trusted reverse proxy hop, the rightmost entry is the real client
      const headers = new Headers({
        "x-forwarded-for": "127.0.0.1, 10.0.0.1, 203.0.113.195",
      });
      expect(resolveClientIp(headers)).toBe("203.0.113.195");
    });

    it("falls back to x-real-ip when x-forwarded-for is absent", () => {
      const headers = new Headers({
        "x-real-ip": "192.0.2.1",
      });
      expect(resolveClientIp(headers)).toBe("192.0.2.1");
    });
  });
});
