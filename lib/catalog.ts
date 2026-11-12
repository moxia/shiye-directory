import "server-only";
import { unstable_cache } from "next/cache";
import { DEMO_CATALOG } from "./demo-data";
import { createPublicSupabaseClient, isSupabaseConfigured } from "./supabase/public";
import { createServerSupabaseClient } from "./supabase/server";
import type { Catalog, Category, Site, SiteSettings } from "./types";

interface CategoryRow {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

interface SiteRow {
  id: string;
  category_id: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
  is_visible: boolean;
  is_featured: boolean;
  updated_at: string;
}

interface SettingsRow {
  site_name_zh: string;
  site_name_en: string;
  tagline_zh: string;
  tagline_en: string;
  intro_zh: string;
  intro_en: string;
  seo_title_zh: string;
  seo_title_en: string;
  seo_description_zh: string;
  seo_description_en: string;
  footer_text_zh: string;
  footer_text_en: string;
  updated_at: string;
}

function mapCategory(row: CategoryRow, siteCount = 0): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { zh: row.name_zh, en: row.name_en },
    description: { zh: row.description_zh, en: row.description_en },
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    siteCount
  };
}

function mapSite(row: SiteRow): Site {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: { zh: row.name_zh, en: row.name_en },
    description: { zh: row.description_zh, en: row.description_en },
    url: row.url,
    iconUrl: row.icon_url,
    domain: new URL(row.url).hostname.replace(/^www\./, ""),
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    isFeatured: row.is_featured,
    updatedAt: row.updated_at
  };
}

function mapSettings(row?: SettingsRow | null): SiteSettings {
  if (!row) return DEMO_CATALOG.settings;
  return {
    siteName: { zh: row.site_name_zh, en: row.site_name_en },
    tagline: { zh: row.tagline_zh, en: row.tagline_en },
    intro: { zh: row.intro_zh, en: row.intro_en },
    seoTitle: { zh: row.seo_title_zh, en: row.seo_title_en },
    seoDescription: { zh: row.seo_description_zh, en: row.seo_description_en },
    footerText: { zh: row.footer_text_zh, en: row.footer_text_en },
    updatedAt: row.updated_at
  };
}

async function fetchPublicCatalog(): Promise<Catalog> {
  if (!isSupabaseConfigured()) return DEMO_CATALOG;
  const supabase = createPublicSupabaseClient();

  const [categoriesResult, sitesResult, settingsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id,slug,name_zh,name_en,description_zh,description_en,sort_order,is_visible,updated_at")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("sites")
      .select("id,category_id,name_zh,name_en,description_zh,description_en,url,icon_url,sort_order,is_visible,is_featured,updated_at")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle()
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (sitesResult.error) throw sitesResult.error;
  if (settingsResult.error) throw settingsResult.error;

  const categoryRows = (categoriesResult.data ?? []) as CategoryRow[];
  const visibleIds = new Set(categoryRows.map((category) => category.id));
  const siteRows = ((sitesResult.data ?? []) as SiteRow[]).filter((site) =>
    visibleIds.has(site.category_id)
  );
  const sites = siteRows.map(mapSite);
  const categories = categoryRows.map((category) =>
    mapCategory(
      category,
      sites.filter((site) => site.categoryId === category.id).length
    )
  );

  return {
    categories,
    sites,
    settings: mapSettings(settingsResult.data as SettingsRow | null),
    demoMode: false
  };
}

export const getPublicCatalog = unstable_cache(fetchPublicCatalog, ["public-catalog"], {
  tags: ["catalog"],
  revalidate: 3600
});

export async function getAdminCatalog(): Promise<Catalog> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ...DEMO_CATALOG, demoMode: true };

  const [categoriesResult, sitesResult, settingsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id,slug,name_zh,name_en,description_zh,description_en,sort_order,is_visible,updated_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("sites")
      .select("id,category_id,name_zh,name_en,description_zh,description_en,url,icon_url,sort_order,is_visible,is_featured,updated_at")
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("*").eq("id", "main").maybeSingle()
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (sitesResult.error) throw sitesResult.error;
  if (settingsResult.error) throw settingsResult.error;

  const sites = ((sitesResult.data ?? []) as SiteRow[]).map(mapSite);
  const categories = ((categoriesResult.data ?? []) as CategoryRow[]).map((category) =>
    mapCategory(
      category,
      sites.filter((site) => site.categoryId === category.id).length
    )
  );

  return {
    categories,
    sites,
    settings: mapSettings(settingsResult.data as SettingsRow | null),
    demoMode: false
  };
}

export function toExportPayload(catalog: Catalog) {
  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    categories: catalog.categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      order: category.sortOrder,
      visible: category.isVisible
    })),
    sites: catalog.sites.map((site) => ({
      categorySlug:
        catalog.categories.find((category) => category.id === site.categoryId)?.slug ?? "",
      name: site.name,
      description: site.description,
      url: site.url,
      iconUrl: site.iconUrl,
      order: site.sortOrder,
      visible: site.isVisible,
      featured: site.isFeatured
    }))
  };
}
