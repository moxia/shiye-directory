export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function canonicalizeUrl(input: string) {
  const url = new URL(input.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  if (url.pathname === "/" && !url.search) {
    url.pathname = "";
  }
  return url.toString().replace(/\/$/, "");
}

export function isHttpUrl(value: string) {
  try {
    canonicalizeUrl(value);
    return true;
  } catch {
    return false;
  }
}

export function getDomain(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function getFaviconUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export function normalizeForSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function getInitials(value: string) {
  const normalized = value.trim();
  if (!normalized) return "·";
  const asciiWords = normalized.split(/\s+/).filter(Boolean);
  if (asciiWords.length > 1) {
    return asciiWords
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  return Array.from(normalized).slice(0, 2).join("").toUpperCase();
}

export function formatInteger(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(value);
}

export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Shanghai"
  }).format(new Date(value));
}

export function copyLocalized(
  value: { zh: string; en: string },
  locale: "zh" | "en"
) {
  return value[locale] || value.zh || value.en;
}

export function fileExtensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}
