import { notFound } from "next/navigation";
import { DataTools } from "@/components/admin/data-tools";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export default async function AdminDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.dataTitle}</h1>
          <p>{dictionary.admin.dataIntro}</p>
        </div>
      </header>
      <DataTools dictionary={dictionary} />
    </>
  );
}
