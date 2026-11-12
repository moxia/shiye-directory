import { notFound } from "next/navigation";
import { SiteManager } from "@/components/admin/site-manager";
import { getAdminCatalog } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export default async function AdminSitesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);
  const catalog = await getAdminCatalog();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.sitesTitle}</h1>
          <p>{dictionary.admin.sitesIntro}</p>
        </div>
      </header>
      <SiteManager locale={locale} dictionary={dictionary} categories={catalog.categories} sites={catalog.sites} />
    </>
  );
}
