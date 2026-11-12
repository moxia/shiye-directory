import type { Category, Locale, Site } from "./types";
import { copyLocalized, normalizeForSearch } from "./utils";

export interface SearchContext {
  query: string;
  categorySlug: string | null;
  locale: Locale;
  categories: Category[];
}

export function searchableSiteText(site: Site, categories: Category[]) {
  const category = categories.find((item) => item.id === site.categoryId);
  return normalizeForSearch(
    [
      site.name.zh,
      site.name.en,
      site.description.zh,
      site.description.en,
      site.domain,
      site.url,
      category?.name.zh,
      category?.name.en,
      category?.description.zh,
      category?.description.en
    ]
      .filter(Boolean)
      .join(" ")
  );
}

export function siteMatchesQuery(site: Site, query: string, categories: Category[]) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return true;
  const haystack = searchableSiteText(site, categories);
  return normalizedQuery.split(" ").every((token) => haystack.includes(token));
}

export function filterSites(
  sites: Site[],
  { query, categorySlug, categories }: Omit<SearchContext, "locale">
) {
  const categoryId = categorySlug
    ? categories.find((category) => category.slug === categorySlug)?.id
    : null;

  return sites.filter((site) => {
    if (categorySlug && site.categoryId !== categoryId) return false;
    return siteMatchesQuery(site, query, categories);
  });
}

export function visibleCategoriesForSites(
  categories: Category[],
  sites: Site[],
  query: string
) {
  return categories
    .map((category) => ({
      ...category,
      siteCount: sites.filter(
        (site) =>
          site.categoryId === category.id && siteMatchesQuery(site, query, categories)
      ).length
    }))
    .filter((category) => category.isVisible);
}

export function localizedSortName(site: Site, locale: Locale) {
  return copyLocalized(site.name, locale).toLocaleLowerCase();
}
