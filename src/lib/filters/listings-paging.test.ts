import { describe, expect, it } from "vitest";
import { nextPageHref, pageFromParams } from "./listings-paging";

describe("pageFromParams", () => {
  it("по умолчанию первая страница", () => {
    expect(pageFromParams(null)).toBe(1);
    expect(pageFromParams("")).toBe(1);
    expect(pageFromParams("abc")).toBe(1);
    expect(pageFromParams("0")).toBe(1);
    expect(pageFromParams("-3")).toBe(1);
  });
  it("число как есть, с потолком", () => {
    expect(pageFromParams("3")).toBe(3);
    expect(pageFromParams("999")).toBe(50);
  });
});

describe("nextPageHref", () => {
  it("первая порция → ?page=2, фильтры сохраняются", () => {
    expect(nextPageHref("/listings", "type=land&district=Haad+Yao", 24, 24)).toBe(
      "/listings?type=land&district=Haad+Yao&page=2",
    );
  });
  it("после двух порций → page=3; уже стоявший page перезаписывается", () => {
    expect(nextPageHref("/ru/listings", "page=2", 48, 24)).toBe("/ru/listings?page=3");
  });
  it("мобильная порция 12 считает страницы по своему размеру", () => {
    expect(nextPageHref("/listings", "", 12, 12)).toBe("/listings?page=2");
    expect(nextPageHref("/listings", "", 36, 12)).toBe("/listings?page=4");
  });
});
