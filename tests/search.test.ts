import { describe, expect, it } from "vitest";
import { filterSites, siteMatchesQuery, visibleCategoriesForSites } from "@/lib/search";
import type { Category, Site } from "@/lib/types";

const categories: Category[] = [{
  id: "10000000-0000-4000-8000-000000000001", slug: "design", name: { zh: "设计", en: "Design" },
  description: { zh: "视觉", en: "Visual" }, sortOrder: 10, isVisible: true, siteCount: 1
}];
const site: Site = {
  id: "20000000-0000-4000-8000-000000000001", categoryId: categories[0].id,
  name: { zh: "花瓣", en: "Figma" }, description: { zh: "协作设计工具", en: "Collaborative design tool" },
  url: "https://www.figma.com", iconUrl: null, domain: "figma.com", sortOrder: 10,
  isVisible: true, isFeatured: true, updatedAt: "2026-11-12T00:00:00Z"
};

describe("catalog search", () => {
  it("matches both languages, descriptions, domains, and category names", () => {
    expect(siteMatchesQuery(site, "花瓣", categories)).toBe(true);
    expect(siteMatchesQuery(site, "collaborative", categories)).toBe(true);
    expect(siteMatchesQuery(site, "figma.com", categories)).toBe(true);
    expect(siteMatchesQuery(site, "设计", categories)).toBe(true);
  });

  it("combines category filtering with search", () => {
    expect(filterSites([site], { query: "figma", categorySlug: "design", categories })).toHaveLength(1);
    expect(filterSites([site], { query: "figma", categorySlug: "missing", categories })).toHaveLength(0);
  });

  it("recomputes visible category result counts", () => {
    expect(visibleCategoriesForSites(categories, [site], "figma")[0].siteCount).toBe(1);
    expect(visibleCategoriesForSites(categories, [site], "absent")[0].siteCount).toBe(0);
  });
});
