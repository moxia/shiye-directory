import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, isLocale } from "./lib/config";

async function refreshSupabaseSession(
  request: NextRequest,
  requestHeaders: Headers
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();
  return response;
}

function preferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("shiye-locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  const accepted = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (accepted.includes("en") && !accepted.startsWith("zh")) return "en";
  return defaultLocale;
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const routeLocale = isLocale(first) ? first : preferredLocale(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-shiye-locale", routeLocale);
  const response = await refreshSupabaseSession(request, requestHeaders);

  if (pathname === "/") {
    return copyCookies(
      response,
      NextResponse.redirect(new URL(`/${routeLocale}${search}`, request.url))
    );
  }

  if (first && !isLocale(first) && first !== "api") {
    return copyCookies(
      response,
      NextResponse.redirect(new URL(`/${routeLocale}${pathname}${search}`, request.url))
    );
  }

  if (first && isLocale(first)) {
    const current = request.cookies.get("shiye-locale")?.value;
    if (current !== first) {
      response.cookies.set("shiye-locale", first, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax"
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"
  ]
};
