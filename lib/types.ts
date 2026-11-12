export type Locale = "zh" | "en";

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
  isVisible: boolean;
  siteCount: number;
}

export interface Site {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  url: string;
  iconUrl: string | null;
  domain: string;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: LocalizedText;
  tagline: LocalizedText;
  intro: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  footerText: LocalizedText;
  updatedAt: string;
}

export interface Catalog {
  categories: Category[];
  sites: Site[];
  settings: SiteSettings;
  demoMode: boolean;
}

export interface AdminSession {
  id: string;
  email: string;
}

export interface ActionState<T = unknown> {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

export interface ImportSummary {
  categoriesCreated: number;
  categoriesUpdated: number;
  sitesCreated: number;
  sitesUpdated: number;
}
