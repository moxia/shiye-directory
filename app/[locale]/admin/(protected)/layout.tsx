import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { AdminMobileNav, AdminNav } from "@/components/admin/admin-nav";
import { LocaleSwitch } from "@/components/locale-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/[locale]/admin/actions";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getAdminSession } from "@/lib/supabase/auth";

export default async function ProtectedAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: value } = await params;
  if (!isLocale(value)) redirect("/zh/admin");
  const locale: Locale = value;
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/admin/login`);
  const dictionary = getDictionary(locale);

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <Link className="brand" href={`/${locale}/admin`}>
          <BrandMark className="brand-mark" />
          <span className="brand-copy">
            <span className="brand-name">{dictionary.brand.name}</span>
            <span className="brand-latin">{dictionary.brand.latin}</span>
          </span>
        </Link>
        <p className="admin-nav-label">{dictionary.admin.title}</p>
        <AdminNav locale={locale} />
        <div className="admin-rail-footer">
          <p className="admin-user" title={session.email}>{session.email}</p>
          <div className="admin-actions" style={{ marginBottom: 10 }}>
            <LocaleSwitch locale={locale} label={dictionary.common.language} />
            <ThemeToggle
              label={dictionary.common.theme}
              lightLabel={dictionary.common.light}
              darkLabel={dictionary.common.dark}
            />
          </div>
          <Link className="header-link" href={`/${locale}`} style={{ display: "block", paddingInline: 0 }}>
            {dictionary.common.viewSite}
          </Link>
          <form action={logoutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button className="text-button" type="submit">{dictionary.admin.signOut}</button>
          </form>
        </div>
      </aside>
      <header className="admin-mobile-bar">
        <div className="admin-mobile-topline">
          <Link className="brand" href={`/${locale}/admin`} aria-label={dictionary.admin.title}>
            <BrandMark className="brand-mark" style={{ width: 28, height: 32 }} />
          </Link>
          <div className="admin-mobile-actions">
            <LocaleSwitch locale={locale} label={dictionary.common.language} />
            <ThemeToggle
              label={dictionary.common.theme}
              lightLabel={dictionary.common.light}
              darkLabel={dictionary.common.dark}
            />
          </div>
        </div>
        <AdminMobileNav locale={locale} />
      </header>
      <main className="admin-content">{children}</main>
    </div>
  );
}
