import { notFound } from "next/navigation";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCatalog } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export default async function AdminCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);
  const catalog = await getAdminCatalog();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.categoriesTitle}</h1>
          <p>{dictionary.admin.categoriesIntro}</p>
        </div>
      </header>
      <CategoryManager locale={locale} dictionary={dictionary} categories={catalog.categories} />
    </>
  );
}
