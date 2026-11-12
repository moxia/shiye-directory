import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicDirectory } from "@/components/public-directory";
import { isLocale, type Locale } from "@/lib/config";
import { getPublicCatalog } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n";
import { copyLocalized } from "@/lib/utils";

export const revalidate = 3600;

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const locale: Locale = value;
  const catalog = await getPublicCatalog();
  const title = copyLocalized(catalog.settings.seoTitle, locale);
  const description = copyLocalized(catalog.settings.seoDescription, locale);
  const base = siteUrl();

  return {
    title,
    description,
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        "zh-CN": `${base}/zh`,
        en: `${base}/en`,
        "x-default": `${base}/zh`
      }
    },
    openGraph: {
      type: "website",
      siteName: copyLocalized(catalog.settings.siteName, locale),
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
      title,
      description,
      url: `${base}/${locale}`,
      images: [{ url: `${base}/${locale}/opengraph-image`, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${base}/${locale}/opengraph-image`]
    }
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const catalog = await getPublicCatalog();
  const dictionary = getDictionary(locale);

  return (
    <Suspense fallback={<div className="empty-state" style={{ marginTop: 64 }}>{dictionary.common.loading}</div>}>
      <PublicDirectory catalog={catalog} locale={locale} />
    </Suspense>
  );
}

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}
