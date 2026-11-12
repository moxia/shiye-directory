import { notFound } from "next/navigation";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminCatalog } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);
  const catalog = await getAdminCatalog();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.settingsTitle}</h1>
          <p>{dictionary.admin.settingsIntro}</p>
        </div>
      </header>
      <SettingsForm dictionary={dictionary} settings={catalog.settings} />
    </>
  );
}
