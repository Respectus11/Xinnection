import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");

function modelBlock(name: string): string {
  const match = schema.match(new RegExp(`model ${name} \\{[\\s\\S]*?\\n\\}`));
  if (!match) throw new Error(`model ${name} missing from schema`);
  return match[0];
}

// Architectural constraint from the spec: no seeker-related model may store
// real identity, IP, device fingerprint, or email. This test keeps future
// schema changes honest.
const SEEKER_MODELS = ["AnonymousSession", "Thread", "Message", "CrisisFlag"];
const FORBIDDEN =
  /\b(ip|ipaddress|device|deviceid|fingerprint|useragent|email|emailhash|fullname|firstname|lastname|phone|location|birthdate)\b/i;

describe("no-PII schema constraint", () => {
  it.each(SEEKER_MODELS)("%s stores no identifying seeker data", (model) => {
    expect(modelBlock(model)).not.toMatch(FORBIDDEN);
  });

  it("stores only the hashed token for anonymous sessions", () => {
    expect(modelBlock("AnonymousSession")).toMatch(/tokenHash\s+String\s+@unique/);
    expect(modelBlock("AnonymousSession")).not.toMatch(/token\s+String/);
  });
});
