export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export function isLocale(value: string | undefined): value is Locale {
  return value === "zh" || value === "en";
}

export function localePath(locale: Locale, path = "") {
  const suffix = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `/${locale}${suffix}`;
}
