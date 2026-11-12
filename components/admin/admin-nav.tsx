"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export function AdminNav({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname();
  const root = `/${locale}/admin`;
  const items = [
    { href: root, label: dictionary.admin.overview, exact: true },
    { href: `${root}/categories`, label: dictionary.admin.categories },
    { href: `${root}/sites`, label: dictionary.admin.sites },
    { href: `${root}/settings`, label: dictionary.admin.settings },
    { href: `${root}/data`, label: dictionary.admin.data },
    { href: `${root}/account`, label: dictionary.admin.account }
  ];

  return (
    <nav className="admin-nav" aria-label={dictionary.admin.title}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const pathname = usePathname();
  const root = `/${locale}/admin`;
  const items = [
    { href: root, label: dictionary.admin.overview, exact: true },
    { href: `${root}/categories`, label: dictionary.admin.categories },
    { href: `${root}/sites`, label: dictionary.admin.sites },
    { href: `${root}/settings`, label: dictionary.admin.settings },
    { href: `${root}/data`, label: dictionary.admin.data },
    { href: `${root}/account`, label: dictionary.admin.account }
  ];

  return (
    <nav className="admin-mobile-nav" aria-label={dictionary.admin.title}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
