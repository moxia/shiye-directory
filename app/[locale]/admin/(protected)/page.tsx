import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCatalog } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { copyLocalized, formatDate, formatInteger } from "@/lib/utils";

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);
  const catalog = await getAdminCatalog();
  const visibleSites = catalog.sites.filter((site) => site.isVisible).length;
  const featuredSites = catalog.sites.filter((site) => site.isFeatured).length;
  const recent = [...catalog.sites].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 7);
  const maxCount = Math.max(1, ...catalog.categories.map((category) => category.siteCount));

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.overviewTitle}</h1>
          <p>{dictionary.admin.overviewIntro}</p>
        </div>
        <div className="admin-actions">
          <Link className="button" href={`/${locale}/admin/categories`}>{dictionary.admin.manageCategories}</Link>
          <Link className="button button-primary" href={`/${locale}/admin/sites`}>{dictionary.admin.manageSites}</Link>
        </div>
      </header>

      {catalog.demoMode ? <p className="form-message" style={{ marginBottom: 20 }}>{dictionary.home.demo}</p> : null}

      <div className="metric-strip">
        <div className="metric"><span>{dictionary.admin.totalSites}</span><strong>{formatInteger(catalog.sites.length, locale)}</strong></div>
        <div className="metric"><span>{dictionary.admin.visibleSites}</span><strong>{formatInteger(visibleSites, locale)}</strong></div>
        <div className="metric"><span>{dictionary.admin.totalCategories}</span><strong>{formatInteger(catalog.categories.length, locale)}</strong></div>
        <div className="metric"><span>{dictionary.admin.featuredSites}</span><strong>{formatInteger(featuredSites, locale)}</strong></div>
      </div>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>{dictionary.admin.recentUpdates}</h2>
            <Link className="text-button" href={`/${locale}/admin/sites`}>{dictionary.admin.manageSites}</Link>
          </div>
          {recent.length ? (
            <ul className="plain-list">
              {recent.map((site) => {
                const category = catalog.categories.find((item) => item.id === site.categoryId);
                return (
                  <li key={site.id}>
                    <div>
                      <strong>{site.name[locale]}</strong>
                      <small>{site.domain} · {category?.name[locale] ?? dictionary.common.category}</small>
                    </div>
                    <small>{formatDate(site.updatedAt, locale)}</small>
                  </li>
                );
              })}
            </ul>
          ) : <p className="form-hint">{dictionary.admin.noRecent}</p>}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>{dictionary.admin.categoryBreakdown}</h2>
            <span className="muted" style={{ fontSize: 10 }}>{catalog.sites.length} {dictionary.common.sites}</span>
          </div>
          <div className="bar-list">
            {catalog.categories.map((category) => (
              <div className="bar-row" key={category.id}>
                <span>{copyLocalized(category.name, locale)}</span>
                <span className="bar-track" aria-hidden="true"><span className="bar-fill" style={{ width: `${(category.siteCount / maxCount) * 100}%`, display: "block" }} /></span>
                <span>{category.siteCount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
