import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export default async function PublicLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{dictionary.common.skipToContent}</a>
      <SiteHeader locale={locale} />
      <main id="main-content" className="public-main">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
