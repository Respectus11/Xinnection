import { describe, expect, it } from "vitest";
import {
  generateThreadKey,
  hashToken,
  openForThread,
  sealForThread,
  unwrapSecret,
  unwrapThreadKey,
  wrapSecret,
  wrapThreadKey,
} from "@/lib/crypto";

describe("application-layer crypto", () => {
  it("seals and opens message text with a thread key", () => {
    const dek = generateThreadKey();
    const sealed = sealForThread(dek, "hello, in Amharic: ሰላም");
    expect(sealed.ciphertext).not.toContain("hello");
    expect(openForThread(dek, sealed)).toBe("hello, in Amharic: ሰላም");
  });

  it("refuses to open with the wrong key", () => {
    const sealed = sealForThread(generateThreadKey(), "secret");
    expect(() => openForThread(generateThreadKey(), sealed)).toThrow();
  });

  it("wraps and unwraps thread keys", () => {
    const dek = generateThreadKey();
    const wrapped = wrapThreadKey(dek);
    expect(wrapped.split(".")).toHaveLength(4);
    expect(unwrapThreadKey(wrapped).equals(dek)).toBe(true);
  });

  it("wraps and unwraps short secrets such as TOTP keys", () => {
    const wrapped = wrapSecret("JBSWY3DPEHPK3PXP");
    expect(unwrapSecret(wrapped)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("binds threadId as AAD to prevent ciphertext swapping between threads", () => {
    const dek = generateThreadKey();
    const sealed = sealForThread(dek, "confidential turn", "thread_alpha");
    // Opening with matching threadId succeeds
    expect(openForThread(dek, sealed, "thread_alpha")).toBe("confidential turn");
    // Attempting to open with mismatched threadId fails due to GCM auth tag mismatch
    expect(() => openForThread(dek, sealed, "thread_beta")).toThrow();
  });

  it("gracefully falls back to open legacy ciphertext without AAD", () => {
    const dek = generateThreadKey();
    const legacySealed = sealForThread(dek, "legacy turn without aad");
    // Can still be opened even when a threadId is passed
    expect(openForThread(dek, legacySealed, "thread_new")).toBe("legacy turn without aad");
  });

  it("strictly validates wrapped key parts and versions", () => {
    expect(() => unwrapThreadKey("invalid")).toThrow(/Malformed wrapped key/);
    expect(() => unwrapThreadKey("99.iv.tag.ct")).toThrow(/Unsupported key version/);
    expect(() => unwrapThreadKey("1.badiv.badtag.ct")).toThrow(/Malformed wrapped key/);
  });

  it("performs timing-safe hash comparison with tokenHashesEqual", async () => {
    const { tokenHashesEqual } = await import("@/lib/crypto");
    const hashA = hashToken("cloud river stone dawn 42 k7q9x");
    const hashB = hashToken("cloud river stone dawn 42 k7q9x");
    const hashC = hashToken("different token entirely");

    expect(tokenHashesEqual(hashA, hashB)).toBe(true);
    expect(tokenHashesEqual(hashA, hashC)).toBe(false);
  });
});

