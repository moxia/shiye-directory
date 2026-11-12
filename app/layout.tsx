import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/noto-serif-sc";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { isLocale, defaultLocale } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "拾页 SHIYE",
  description: "A bilingual, curated web directory."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-shiye-locale") || defaultLocale;
  const lang = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
