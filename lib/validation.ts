import { z } from "zod";
import { canonicalizeUrl, isHttpUrl, slugify } from "./utils";

const requiredText = (max: number) =>
  z.string().trim().min(1, "required").max(max, `max:${max}`);

export const localizedTextSchema = z.object({
  zh: requiredText(240),
  en: requiredText(240)
});

export const categoryFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(1, "required")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug"),
  nameZh: requiredText(80),
  nameEn: requiredText(80),
  descriptionZh: requiredText(300),
  descriptionEn: requiredText(300),
  isVisible: z.boolean()
});

export const siteFormSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  categoryId: z.string().uuid(),
  nameZh: requiredText(80),
  nameEn: requiredText(80),
  descriptionZh: requiredText(300),
  descriptionEn: requiredText(300),
  url: z
    .string()
    .trim()
    .min(1, "required")
    .refine(isHttpUrl, "url")
    .transform((value) => canonicalizeUrl(value)),
  iconUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isHttpUrl(value), "iconUrl")
    .transform((value) => value || null),
  isVisible: z.boolean(),
  isFeatured: z.boolean()
});

export const settingsFormSchema = z.object({
  siteNameZh: requiredText(80),
  siteNameEn: requiredText(80),
  taglineZh: requiredText(120),
  taglineEn: requiredText(120),
  introZh: requiredText(400),
  introEn: requiredText(400),
  seoTitleZh: requiredText(120),
  seoTitleEn: requiredText(120),
  seoDescriptionZh: requiredText(300),
  seoDescriptionEn: requiredText(300),
  footerZh: requiredText(240),
  footerEn: requiredText(240)
});

export const passwordFormSchema = z
  .object({
    password: z.string().min(8, "passwordLength").max(72),
    confirmPassword: z.string().min(8).max(72)
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"]
  });

export const importCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: localizedTextSchema,
  description: localizedTextSchema,
  order: z.number().int().min(0).max(100000),
  visible: z.boolean()
});

export const importSiteSchema = z.object({
  categorySlug: z.string().trim().min(1).max(60),
  name: localizedTextSchema,
  description: localizedTextSchema,
  url: z
    .string()
    .trim()
    .min(1)
    .refine(isHttpUrl)
    .transform((value) => canonicalizeUrl(value)),
  iconUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isHttpUrl(value))
    .nullable()
    .optional()
    .transform((value) => value || null),
  order: z.number().int().min(0).max(100000),
  visible: z.boolean(),
  featured: z.boolean()
});

export const catalogImportSchema = z
  .object({
    version: z.literal(1),
    exportedAt: z.string().datetime().optional(),
    categories: z.array(importCategorySchema).max(100),
    sites: z.array(importSiteSchema).max(500)
  })
  .superRefine((value, context) => {
    const slugs = new Set<string>();
    for (const category of value.categories) {
      if (slugs.has(category.slug)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate category slug: ${category.slug}`,
          path: ["categories"]
        });
      }
      slugs.add(category.slug);
    }
    for (const site of value.sites) {
      if (!slugs.has(site.categorySlug)) {
        context.addIssue({
          code: "custom",
          message: `Unknown category slug: ${site.categorySlug}`,
          path: ["sites"]
        });
      }
    }
  });

export type CatalogImport = z.infer<typeof catalogImportSchema>;

export function booleanFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

export function formText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function autoSlug(formData: FormData) {
  const current = formText(formData, "slug");
  return current || slugify(formText(formData, "nameEn"));
}
