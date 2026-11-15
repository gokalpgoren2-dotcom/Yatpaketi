import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, GATE_MAX_AGE, gateClosed, gateToken } from "@/lib/gate";

// /admin altında: oturumu yeniler ve girişsiz erişimi giriş sayfasına yönlendirir.
// Diğer sayfalarda: "kapalı mod" açıksa ekip dışındaki ziyaretçileri /yakinda sayfasına yollar.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin")) return gate(request, path);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin = path === "/admin/login";

  if (!url || !key) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  // Yönetime giriş yapılan cihaz, kapalı modda da siteyi görebilsin.
  if (user) {
    const t = await gateToken();
    if (request.cookies.get(GATE_COOKIE)?.value !== t) response.cookies.set(GATE_COOKIE, t, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: GATE_MAX_AGE });
  }
  return response;
}

async function gate(request: NextRequest, path: string) {
  const closed = await gateClosed();
  const soon = path === "/yakinda";
  if (!closed) return soon ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  const team = request.cookies.get(GATE_COOKIE)?.value === (await gateToken());
  if (team) return soon ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  if (soon) return NextResponse.next();
  const res = NextResponse.redirect(new URL("/yakinda", request.url), 307);
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

// Dosyalar (uzantılı yollar), Next'in kendi dosyaları ve /api dışında her yolda çalışır.
export const config = { matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"] };
