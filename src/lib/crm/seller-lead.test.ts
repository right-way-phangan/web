import { describe, expect, it } from "vitest";
import { composeSellerLead, type SellerListingInput } from "./seller-lead";

const base: SellerListingInput = {
  name: "Erez",
  propertyType: "land",
  location: "Haad Yao",
};

describe("composeSellerLead — lead name", () => {
  it("builds a scannable board title from name, type and location", () => {
    const { leadName } = composeSellerLead(base);
    expect(leadName).toBe("Property for sale · Erez · Land, Haad Yao");
  });

  it("caps the title at 120 chars for very long inputs", () => {
    const { leadName } = composeSellerLead({ ...base, location: "x".repeat(300) });
    expect(leadName.length).toBeLessThanOrEqual(120);
  });
});

describe("composeSellerLead — note", () => {
  it("lists only the facts that were provided", () => {
    const { note } = composeSellerLead({
      ...base,
      size: "2 rai",
      tenure: "leasehold",
      price: "8,000,000 THB",
      hasDocs: true,
    });
    expect(note).toContain("Type: Land");
    expect(note).toContain("Location: Haad Yao");
    expect(note).toContain("Size: 2 rai");
    expect(note).toContain("Tenure: Leasehold");
    expect(note).toContain("Asking price: 8,000,000 THB");
    expect(note).toContain("Title docs: owner has them ready");
  });

  it("omits optional facts that were left blank", () => {
    const { note } = composeSellerLead(base);
    expect(note).toContain("Type: Land");
    expect(note).not.toContain("Size:");
    expect(note).not.toContain("Tenure:");
    expect(note).not.toContain("Asking price:");
    expect(note).not.toContain("Title docs:");
  });

  it("includes the owner's free text and reply channel", () => {
    const { note } = composeSellerLead({
      ...base,
      message: "Sea view, road access ready",
      replyVia: "whatsapp",
    });
    expect(note).toContain("Owner's note:\nSea view, road access ready");
    expect(note).toContain("Reply via: whatsapp");
  });

  it("flags an RU submission so the agent replies in Russian", () => {
    const en = composeSellerLead(base);
    const ru = composeSellerLead({ ...base, lang: "ru" });
    expect(en.note).not.toContain("RU site");
    expect(ru.note).toContain("🗣️ Submitted on the RU site — reply in Russian");
  });

  it("adds a Traffic line only when attribution is present", () => {
    expect(composeSellerLead(base).note).not.toContain("Traffic:");
    const withUtm = composeSellerLead({ ...base, utmSource: "facebook", landing: "/ru/sell" });
    expect(withUtm.note).toContain("Traffic: facebook · landed: /ru/sell");
  });
});

describe("composeSellerLead — tags", () => {
  it("always carries the seller-listing routing tags", () => {
    const { tags } = composeSellerLead(base);
    expect(tags).toEqual(
      expect.arrayContaining(["website", "website-contact", "seller-listing", "seller-lead", "type:land"]),
    );
  });

  it("adds tenure / reply / utm tags only when provided", () => {
    const bare = composeSellerLead(base).tags;
    expect(bare).not.toEqual(expect.arrayContaining(["tenure:leasehold", "reply:telegram"]));

    const full = composeSellerLead({
      ...base,
      tenure: "leasehold",
      replyVia: "telegram",
      lang: "ru",
      utmSource: "facebook",
    }).tags;
    expect(full).toEqual(
      expect.arrayContaining(["tenure:leasehold", "reply:telegram", "lang:ru", "utm-source:facebook"]),
    );
  });
});
