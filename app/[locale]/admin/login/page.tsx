import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/admin/login-form";
import { LocaleSwitch } from "@/components/locale-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getAdminSession } from "@/lib/supabase/auth";

export default async function AdminLoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const session = await getAdminSession();
  if (session) redirect(`/${locale}/admin`);
  const dictionary = getDictionary(locale);

  return (
    <main className="login-page">
      <div className="login-wrap">
        <div className="admin-actions" style={{ justifyContent: "flex-end", marginBottom: 26 }}>
          <Suspense fallback={null}>
            <LocaleSwitch locale={locale} label={dictionary.common.language} />
          </Suspense>
          <ThemeToggle
            label={dictionary.common.theme}
            lightLabel={dictionary.common.light}
            darkLabel={dictionary.common.dark}
          />
        </div>
        <Link className="brand login-brand" href={`/${locale}`}>
          <BrandMark className="brand-mark" />
          <span className="brand-copy">
            <span className="brand-name">{dictionary.brand.name}</span>
            <span className="brand-latin">{dictionary.brand.latin}</span>
          </span>
        </Link>
        <h1>{dictionary.admin.loginTitle}</h1>
        <p>{dictionary.admin.loginIntro}</p>
        <LoginForm locale={locale} />
        <p className="login-footer">
          <Link className="text-button" href={`/${locale}`}>
            {dictionary.common.viewSite}
          </Link>
        </p>
      </div>
    </main>
  );
}
