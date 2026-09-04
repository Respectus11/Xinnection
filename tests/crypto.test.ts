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

  it("hashes tokens deterministically and normalizes retyped codes", () => {
    expect(hashToken("Cloud-River-Stone-42-k7q")).toBe(hashToken("cloud-river-stone-42-k7q"));
    expect(hashToken(" cloud-river-stone-42-k7q ")).toBe(hashToken("cloud-river-stone-42-k7q"));
  });
});
