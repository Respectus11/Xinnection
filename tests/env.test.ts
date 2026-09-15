import { describe, expect, it } from "vitest";
import { validateProductionEnv } from "@/lib/env";

const good = {
  AUTH_SECRET: Buffer.alloc(32, 7).toString("base64"),
  MSG_KEY_V1: Buffer.alloc(32, 9).toString("base64"),
  TOKEN_PEPPER: "a-pepper-of-decent-length",
  DATABASE_URL: "postgresql://localhost:5432/xinnection",
  REDIS_URL: "redis://localhost:6379",
};

describe("validateProductionEnv", () => {
  it("accepts a complete, well-formed environment", () => {
    expect(validateProductionEnv(good)).toEqual([]);
  });

  it("flags every missing required variable by name", () => {
    const names = validateProductionEnv({})
      .map((p) => p.name)
      .sort();
    expect(names).toEqual(["AUTH_SECRET", "DATABASE_URL", "MSG_KEY_V1", "REDIS_URL", "TOKEN_PEPPER"]);
  });

  it("rejects short secrets and wrong-size keys without echoing values", () => {
    const problems = validateProductionEnv({
      ...good,
      AUTH_SECRET: "too-short-secret-value",
      MSG_KEY_V1: Buffer.alloc(16).toString("base64"),
    });
    expect(problems.map((p) => p.name).sort()).toEqual(["AUTH_SECRET", "MSG_KEY_V1"]);
    for (const problem of problems) {
      expect(JSON.stringify(problem)).not.toContain("too-short");
    }
  });
});
