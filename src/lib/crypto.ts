import crypto from "node:crypto";
import { config } from "./config";

// Application-layer encryption.
//
// Design:
// - Every thread gets its own random 32-byte data encryption key (DEK).
// - The DEK is wrapped (encrypted) with a versioned AES-256-GCM master key
//   (MSG_KEY_V<n>) and stored alongside the thread.
// - Message bodies are sealed with the thread's DEK — the database only ever
//   sees ciphertext + IV + auth tag, never plaintext.
// - Key rotation: add MSG_KEY_V2 etc.; the key version travels with every
//   ciphertext so old data stays readable while new data uses the new key.
// - Deleting a thread deletes its wrapped DEK with it, so ciphertext copies
//   (e.g. in backups, until their TTL) become unreadable.

export const LATEST_KEY_VERSION = 1;

function masterKey(version: number): Buffer {
  const raw = process.env[`MSG_KEY_V${version}`];
  if (!raw) throw new Error(`Missing MSG_KEY_V${version} environment variable`);
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error(`MSG_KEY_V${version} must decode to exactly 32 bytes`);
  return buf;
}

export function generateThreadKey(): Buffer {
  return crypto.randomBytes(32);
}

// Returns "version.iv.authTag.ciphertext" (all base64 except the version).
export function wrapThreadKey(dek: Buffer, version: number = LATEST_KEY_VERSION): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", masterKey(version), iv);
  const ct = Buffer.concat([cipher.update(dek), cipher.final()]);
  return [String(version), iv.toString("base64"), cipher.getAuthTag().toString("base64"), ct.toString("base64")].join(".");
}

export function unwrapThreadKey(wrapped: string): Buffer {
  const parts = typeof wrapped === "string" ? wrapped.split(".") : [];
  if (parts.length !== 4) throw new Error("Malformed wrapped key");
  const [versionStr, ivB64, tagB64, ctB64] = parts;
  const version = Number(versionStr);
  if (!Number.isInteger(version) || version < 1 || version > LATEST_KEY_VERSION) {
    throw new Error("Unsupported key version");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  if (iv.length !== 12 || tag.length !== 16) throw new Error("Malformed wrapped key");
  const decipher = crypto.createDecipheriv("aes-256-gcm", masterKey(version), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
}

export type SealedText = { ciphertext: string; iv: string; authTag: string; keyVersion: number };

// `aad` (the thread id) is bound into the GCM tag as associated data so a
// ciphertext cannot be moved to a different thread/row and still verify.
export function sealForThread(dek: Buffer, plaintext: string, aad?: string): SealedText {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: ct.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: LATEST_KEY_VERSION,
  };
}

function decryptWith(dek: Buffer, sealed: SealedText, aad?: string): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", dek, Buffer.from(sealed.iv, "base64"));
  if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(Buffer.from(sealed.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(sealed.ciphertext, "base64")), decipher.final()]).toString("utf8");
}

// Tries the AAD-bound form first; falls back to the legacy (no-AAD) form so
// messages written before AAD binding remain readable. The per-thread DEK
// already isolates threads from each other, so the fallback is no weaker than
// the previous scheme.
export function openForThread(dek: Buffer, sealed: SealedText, aad?: string): string {
  if (aad) {
    try {
      return decryptWith(dek, sealed, aad);
    } catch {
      /* legacy ciphertext without AAD */
    }
  }
  return decryptWith(dek, sealed);
}

// Short secrets (e.g. TOTP shared secrets) use the same wrapping scheme.
export function wrapSecret(secret: string): string {
  return wrapThreadKey(Buffer.from(secret, "utf8"));
}

export function unwrapSecret(wrapped: string): string {
  return unwrapThreadKey(wrapped).toString("utf8");
}

// Anonymous session tokens are stored ONLY as a peppered SHA-256 hash — the
// raw token exists nowhere server-side. Lookup is normalized to be forgiving
// of people retyping a code from paper (case, whitespace).
export function hashToken(rawToken: string): string {
  const normalized = String(rawToken).slice(0, 256).trim().toLowerCase().replace(/[\s-]+/g, "");
  return crypto.createHmac("sha256", config.tokenPepper).update(normalized).digest("hex");
}

// Constant-time comparison of two hex token hashes.
export function tokenHashesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
