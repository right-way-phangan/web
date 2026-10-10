import { describe, expect, it } from "vitest";
import { canAccessAdminPath } from "./roles";

describe("canAccessAdminPath", () => {
  it("lets an admin anywhere", () => {
    expect(canAccessAdminPath("admin", "/admin/finance")).toBe(true);
    expect(canAccessAdminPath("admin", "/admin/crm")).toBe(true);
  });

  it("lets an agent into CRM, catalogue and intake", () => {
    expect(canAccessAdminPath("agent", "/admin/crm")).toBe(true);
    expect(canAccessAdminPath("agent", "/admin/crm/leads/42")).toBe(true);
    expect(canAccessAdminPath("agent", "/admin/objects")).toBe(true);
    expect(canAccessAdminPath("agent", "/admin/new")).toBe(true);
  });

  it("keeps an agent out of money and infrastructure", () => {
    expect(canAccessAdminPath("agent", "/admin/finance")).toBe(false);
    expect(canAccessAdminPath("agent", "/admin/health")).toBe(false);
    expect(canAccessAdminPath("agent", "/admin")).toBe(false);
  });

  it("does not let a prefix collision open a section", () => {
    // /admin/new must not also unlock /admin/newsletter-style siblings
    expect(canAccessAdminPath("agent", "/admin/newsroom")).toBe(false);
    expect(canAccessAdminPath("agent", "/admin/objects-export")).toBe(false);
  });

  it("treats an unknown role as no access", () => {
    expect(canAccessAdminPath("", "/admin/crm")).toBe(false);
    expect(canAccessAdminPath("viewer", "/admin/crm")).toBe(false);
  });

  it("partner reaches only the lead board and a numeric lead card", () => {
    expect(canAccessAdminPath("partner", "/admin/crm")).toBe(true);
    expect(canAccessAdminPath("partner", "/admin/crm/42")).toBe(true);
    for (const p of [
      "/admin", "/admin/finance", "/admin/objects", "/admin/new", "/admin/guide",
      "/admin/crm/new", "/admin/crm/export", "/admin/crm/tasks", "/admin/crm/contacts",
      "/admin/crm/contacts/dupes", "/admin/crm/triage", "/admin/crm/import", "/admin/crm/stats",
      "/admin/crm/42/edit", "/admin/crm/42/../tasks", "/admin/crm/4x", "/admin/api/search",
      "/admin/api/photo-audit/purge", "/admin/journey", "/admin/partners",
    ]) {
      expect(canAccessAdminPath("partner", p), p).toBe(false);
    }
  });
});
