import { describe, expect, it } from "vitest";
import { catalogImportSchema, categoryFormSchema, siteFormSchema } from "@/lib/validation";

describe("form validation", () => {
  it("requires bilingual category copy and a valid slug", () => {
    const result = categoryFormSchema.safeParse({
      id: "", slug: "Bad Slug", nameZh: "开发", nameEn: "", descriptionZh: "说明", descriptionEn: "",
      isVisible: true
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.slug).toBeTruthy();
      expect(fields.nameEn).toBeTruthy();
    }
  });

  it("rejects unsafe site URLs and canonicalizes valid ones", () => {
    const base = {
      id: "", categoryId: "10000000-0000-4000-8000-000000000001",
      nameZh: "示例", nameEn: "Example", descriptionZh: "说明", descriptionEn: "Description",
      iconUrl: "", isVisible: true, isFeatured: false
    };
    expect(siteFormSchema.safeParse({ ...base, url: "javascript:alert(1)" }).success).toBe(false);
    const valid = siteFormSchema.safeParse({ ...base, url: "https://Example.com/" });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.url).toBe("https://example.com");
  });
});

describe("catalog import validation", () => {
  const category = {
    slug: "ai", name: { zh: "AI", en: "AI" }, description: { zh: "工具", en: "Tools" },
    order: 10, visible: true
  };
  const site = {
    categorySlug: "ai", name: { zh: "示例", en: "Example" }, description: { zh: "说明", en: "Description" },
    url: "https://example.com", iconUrl: null, order: 10, visible: true, featured: false
  };

  it("accepts a version 1 payload", () => {
    expect(catalogImportSchema.safeParse({ version: 1, categories: [category], sites: [site] }).success).toBe(true);
  });

  it("rejects duplicate category slugs", () => {
    const result = catalogImportSchema.safeParse({ version: 1, categories: [category, category], sites: [site] });
    expect(result.success).toBe(false);
  });

  it("rejects sites under unknown categories", () => {
    const result = catalogImportSchema.safeParse({
      version: 1, categories: [category], sites: [{ ...site, categorySlug: "missing" }]
    });
    expect(result.success).toBe(false);
  });
});
