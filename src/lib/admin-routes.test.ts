import { describe, expect, it } from "vitest";

import { isAdminRoute } from "@/lib/admin-routes";

describe("isAdminRoute", () => {
  it("treats admin pages as private chrome routes", () => {
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/login")).toBe(true);
  });

  it("does not treat public pages as admin routes", () => {
    expect(isAdminRoute("/")).toBe(false);
    expect(isAdminRoute("/menu")).toBe(false);
    expect(isAdminRoute("/order")).toBe(false);
  });
});
