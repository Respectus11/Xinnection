import { describe, expect, it } from "vitest";
import { generateSeekerCode } from "@/lib/token";
import { toThreadDto } from "@/lib/dto";
import { generateThreadKey, wrapThreadKey, sealForThread } from "@/lib/crypto";
import type { Message } from "@prisma/client";

describe("DTO sanitization and Seeker Code entropy", () => {
  it("generates seeker code with 4 words, 2 digits, and 5 alphanumeric characters", () => {
    const code = generateSeekerCode();
    const parts = code.split(" ");
    expect(parts).toHaveLength(6); // word, word, word, word, 2-digits, 5-chars
    expect(parts[4]).toMatch(/^\d{2}$/);
    expect(parts[5]).toMatch(/^[a-z0-9]{5}$/);
  });

  it("toThreadDto strips wrappedDek, tokenHash, and IV/authTag while providing decrypted text", () => {
    const threadId = "thread_test_123";
    const dek = generateThreadKey();
    const wrappedDek = wrapThreadKey(dek);
    const sealed = sealForThread(dek, "Confidential reflection content", threadId);

    const mockMessage: Message = {
      id: "msg_1",
      threadId,
      senderRole: "SEEKER",
      ciphertext: sealed.ciphertext,
      iv: sealed.iv,
      authTag: sealed.authTag,
      keyVersion: 1,
      createdAt: new Date(),
    };

    const mockThreadRow = {
      id: threadId,
      status: "OPEN",
      language: "en",
      claimedById: null,
      claimedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      wrappedDek,
      session: { tokenHash: "super-secret-peppered-hash" },
      messages: [mockMessage],
    };

    const dto = toThreadDto(mockThreadRow);

    // Assert that sensitive fields are never in the returned DTO
    expect(dto).not.toHaveProperty("wrappedDek");
    expect(dto).not.toHaveProperty("session");
    expect(dto).not.toHaveProperty("tokenHash");
    expect(dto.messages[0]).not.toHaveProperty("iv");
    expect(dto.messages[0]).not.toHaveProperty("authTag");

    // Assert that decrypted content is available
    expect(dto.messages[0].text).toBe("Confidential reflection content");
    expect(dto.messages[0].ciphertext).toBe("Confidential reflection content");
  });
});
