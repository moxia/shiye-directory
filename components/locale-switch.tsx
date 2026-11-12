"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/lib/config";

export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  function switchTo(nextLocale: Locale) {
    const path = pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${nextLocale}`);
    const target = `${path}${query ? `?${query}` : ""}${window.location.hash}`;
    router.push(target, { scroll: false });
  }

  return (
    <div className="locale-switch" aria-label={label}>
      {locales.map((item) => (
        <a
          key={item}
          href={`${pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${item}`)}${query ? `?${query}` : ""}`}
          hrefLang={item}
          aria-current={item === locale ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            switchTo(item);
          }}
        >
          {item}
        </a>
      ))}
    </div>
  );
}



