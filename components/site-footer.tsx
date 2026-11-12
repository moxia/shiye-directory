import Link from "next/link";
import type { Locale } from "@/lib/config";
import { localePath } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <footer className="site-footer">
      <span className="footer-brand">
        {dictionary.brand.name} / {dictionary.brand.latin}
      </span>
      <span>{dictionary.home.footer}</span>
      <Link href={localePath(locale, "admin")}>{dictionary.common.admin}</Link>
    </footer>
  );
}
