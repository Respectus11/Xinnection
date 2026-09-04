import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookies: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

import { createSessionToken, requireRole } from "@/lib/auth";

function withCookies(value: string | undefined) {
  mocks.cookies.mockResolvedValue({
    get: () => (value ? { value } : undefined),
    set: vi.fn(),
    delete: vi.fn(),
  });
}

// The spec requires proof that unauthenticated requests to any admin or
// professional endpoint are rejected — RBAC lives at the API layer, not in
// hidden UI.
describe("RBAC at the API layer", () => {
  beforeEach(() => {
    mocks.cookies.mockReset();
  });

  it("rejects unauthenticated requests with 401", async () => {
    withCookies(undefined);
    await expect(requireRole(["ADMIN"])).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHENTICATED",
    });
  });

  it("rejects a professional reaching an admin endpoint with 403", async () => {
    const token = await createSessionToken({ sub: "pro_1", role: "PROFESSIONAL", name: "Amina" });
    withCookies(token);
    await expect(requireRole(["ADMIN", "SUPER_ADMIN"])).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });

  it("admits an admin to an admin endpoint", async () => {
    const token = await createSessionToken({ sub: "admin_1", role: "ADMIN", name: "Admin" });
    withCookies(token);
    const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    expect(session.sub).toBe("admin_1");
  });

  it("rejects tampered cookies", async () => {
    withCookies("not-a-jwt");
    await expect(requireRole(["PROFESSIONAL"])).rejects.toMatchObject({ status: 401 });
  });
});
