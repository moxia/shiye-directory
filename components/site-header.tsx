import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { LocaleSwitch } from "./locale-switch";
import { ThemeToggle } from "./theme-toggle";
import type { Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/config";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);

  return (
    <header className="site-header">
      <Link className="brand" href={localePath(locale)} aria-label={dictionary.brand.name}>
        <BrandMark className="brand-mark" />
        <span className="brand-copy">
          <span className="brand-name">{dictionary.brand.name}</span>
          <span className="brand-latin">{dictionary.brand.latin}</span>
        </span>
      </Link>
      <div className="header-actions">
        <Link className="header-link" href={localePath(locale, "admin")}>
          {dictionary.common.admin}
        </Link>
        <LocaleSwitch locale={locale} label={dictionary.common.language} />
        <ThemeToggle
          label={dictionary.common.theme}
          lightLabel={dictionary.common.light}
          darkLabel={dictionary.common.dark}
        />
      </div>
    </header>
  );
}
