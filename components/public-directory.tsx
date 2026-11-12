"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteIcon } from "@/components/site-icon";
import type { Catalog, Locale, Site } from "@/lib/types";
import { copyLocalized, formatInteger } from "@/lib/utils";
import { filterSites, visibleCategoriesForSites } from "@/lib/search";
import { formatMessage, getDictionary } from "@/lib/i18n";

type Filter = string | null;

function SiteRow({ site, locale }: { site: Site; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const secondaryName = locale === "zh" ? site.name.en : site.name.zh;

  return (
    <a
      className="site-row"
      href={site.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${copyLocalized(site.name, locale)} — ${dictionary.common.externalLink}`}
    >
      <SiteIcon name={copyLocalized(site.name, locale)} url={site.url} iconUrl={site.iconUrl} />
      <div>
        <p className="site-name">
          {copyLocalized(site.name, locale)}
          {secondaryName && secondaryName !== copyLocalized(site.name, locale) ? (
            <small>{secondaryName}</small>
          ) : null}
        </p>
      </div>
      <p className="site-description">{copyLocalized(site.description, locale)}</p>
      <span className="site-domain">{site.domain}</span>
      <ArrowUpRight className="site-arrow" aria-hidden="true" />
    </a>
  );
}

function FeaturedShelf({ sites, locale }: { sites: Site[]; locale: Locale }) {
  const dictionary = getDictionary(locale);
  if (!sites.length) return null;

  return (
    <section className="featured-section" aria-labelledby="featured-title">
      <div className="section-heading">
        <h2 id="featured-title">{dictionary.home.featuredTitle}</h2>
        <p>{dictionary.home.featuredIntro}</p>
      </div>
      <div className="featured-list">
        {sites.map((site, index) => (
          <a
            className="featured-item"
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            key={site.id}
          >
            <span className="featured-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="featured-copy">
              <strong>{copyLocalized(site.name, locale)}</strong>
              <span>{copyLocalized(site.description, locale)}</span>
              <span className="featured-domain">{site.domain}</span>
            </span>
            <ArrowUpRight className="featured-arrow" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function PublicDirectory({
  catalog,
  locale
}: {
  catalog: Catalog;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialCategory = searchParams.get("category");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [categorySlug, setCategorySlug] = useState<Filter>(
    catalog.categories.some((category) => category.slug === initialCategory)
      ? initialCategory
      : null
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (categorySlug) params.set("category", categorySlug);
      const next = params.toString();
      router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [categorySlug, pathname, query, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape" && (query || categorySlug)) {
        setQuery("");
        setCategorySlug(null);
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [categorySlug, query]);

  const filteredSites = useMemo(
    () => filterSites(catalog.sites, { query, categorySlug, categories: catalog.categories }),
    [catalog.categories, catalog.sites, categorySlug, query]
  );

  const categoriesWithCounts = useMemo(
    () => visibleCategoriesForSites(catalog.categories, catalog.sites, query),
    [catalog.categories, catalog.sites, query]
  );

  const groups = useMemo(
    () =>
      categoriesWithCounts
        .filter((category) => !categorySlug || category.slug === categorySlug)
        .map((category) => ({
          category,
          sites: filteredSites
            .filter((site) => site.categoryId === category.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        }))
        .filter((group) => group.sites.length > 0),
    [categoriesWithCounts, categorySlug, filteredSites]
  );

  const featuredSites = catalog.sites
    .filter((site) => site.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const hasFilters = Boolean(query.trim() || categorySlug);

  function clearFilters() {
    setQuery("");
    setCategorySlug(null);
    inputRef.current?.focus();
  }

  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="hero-kicker">{dictionary.brand.descriptor}</p>
          <h1 id="page-title">{dictionary.home.title}</h1>
        </div>
        <div className="hero-side">
          <p className="hero-intro">{copyLocalized(catalog.settings.intro, locale)}</p>
          <div className="catalog-count">
            <strong>{formatInteger(catalog.sites.length, locale)}</strong>
            <span>{dictionary.home.totalLabel}</span>
            <span className="catalog-count-separator">/</span>
            <span>{formatInteger(catalog.categories.length, locale)}</span>
            <span>{dictionary.home.categoriesLabel}</span>
          </div>
        </div>
      </section>

      {catalog.demoMode ? (
        <p className="demo-note">
          <strong>Demo</strong> — {dictionary.home.demo}
        </p>
      ) : null}

      <section className="search-stage" aria-label={dictionary.common.search}>
        <div className="search-form">
          <Search className="search-icon" aria-hidden="true" />
          <label className="sr-only" htmlFor="catalog-search">
            {dictionary.common.search}
          </label>
          <input
            ref={inputRef}
            id="catalog-search"
            className="search-input"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.home.searchPlaceholder}
          />
          {query ? (
            <button
              className="search-clear"
              type="button"
              onClick={() => setQuery("")}
              aria-label={dictionary.home.clearSearch}
            >
              <X aria-hidden="true" />
            </button>
          ) : (
            <span className="search-shortcut" aria-hidden="true">/</span>
          )}
        </div>
        <div className="search-meta" aria-live="polite">
          <span>
            {formatMessage(dictionary.home.resultCount, { count: filteredSites.length })}
          </span>
          <span>{dictionary.home.keyboardHint}</span>
        </div>
      </section>

      {!hasFilters ? <FeaturedShelf sites={featuredSites} locale={locale} /> : null}

      <section className="directory-section" id="directory" aria-labelledby="directory-title">
        <aside className="category-rail" aria-label={dictionary.common.categories}>
          <p className="rail-label">{dictionary.common.categories}</p>
          <div className="category-list">
            <button
              type="button"
              className="category-tab"
              aria-pressed={!categorySlug}
              onClick={() => setCategorySlug(null)}
            >
              <span className="category-tab-index">00</span>
              <span className="category-tab-name">{dictionary.common.all}</span>
              <span className="category-tab-count">{catalog.sites.length}</span>
            </button>
            {categoriesWithCounts.map((category, index) => (
              <button
                key={category.id}
                type="button"
                className="category-tab"
                aria-pressed={categorySlug === category.slug}
                onClick={() => setCategorySlug(category.slug)}
              >
                <span className="category-tab-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="category-tab-name">{copyLocalized(category.name, locale)}</span>
                <span className="category-tab-count">{category.siteCount}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="directory-main">
          <div className="mobile-categories" aria-label={dictionary.common.categories}>
            <div className="mobile-category-list">
              <button
                type="button"
                className="category-tab"
                aria-pressed={!categorySlug}
                onClick={() => setCategorySlug(null)}
              >
                <span className="category-tab-name">{dictionary.common.all}</span>
                <span className="category-tab-count">{catalog.sites.length}</span>
              </button>
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="category-tab"
                  aria-pressed={categorySlug === category.slug}
                  onClick={() => setCategorySlug(category.slug)}
                >
                  <span className="category-tab-name">{copyLocalized(category.name, locale)}</span>
                  <span className="category-tab-count">{category.siteCount}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="directory-header">
            <div className="directory-title">
              <p className="directory-eyebrow">{dictionary.home.directoryTitle}</p>
              <h2 id="directory-title">
                {categorySlug
                  ? copyLocalized(
                      catalog.categories.find((category) => category.slug === categorySlug)!.name,
                      locale
                    )
                  : dictionary.home.directoryTitle}
              </h2>
            </div>
          </div>

          {groups.length ? (
            groups.map(({ category, sites }, groupIndex) => (
              <section
                className="site-group"
                id={`category-${category.slug}`}
                key={category.id}
                aria-labelledby={`category-title-${category.slug}`}
              >
                <div className="site-group-heading">
                  <div className="site-group-title">
                    <span className="site-group-index">
                      {String(groupIndex + 1).padStart(2, "0")}
                    </span>
                    <h3 id={`category-title-${category.slug}`}>
                      {copyLocalized(category.name, locale)}
                    </h3>
                  </div>
                </div>
                <p className="site-group-description">
                  {copyLocalized(category.description, locale)}
                </p>
                <div className="site-list">
                  {sites.map((site) => (
                    <SiteRow key={site.id} site={site} locale={locale} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-state-mark" aria-hidden="true">拾</span>
              <h3>{dictionary.home.noResultsTitle}</h3>
              <p>{dictionary.home.noResultsBody}</p>
              <button type="button" className="text-button" onClick={clearFilters}>
                {dictionary.home.clearFilters}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
