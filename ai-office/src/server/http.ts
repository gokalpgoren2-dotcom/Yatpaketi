import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { authorize, sameOrigin, SESSION_COOKIE, type AuthResult } from "./auth";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (status: number, error: string) => json({ error }, status);

export async function currentAuth(): Promise<AuthResult> {
  const h = await headers();
  const c = await cookies();
  return authorize(h.get("host"), c.get(SESSION_COOKIE)?.value, h.get("x-forwarded-for"));
}

/** API koruması: yetki ve (durum değiştiren isteklerde) kaynak kontrolü. Sorun yoksa null döner. */
export async function guard(req: Request, mutating = false): Promise<NextResponse | null> {
  if (mutating && !sameOrigin(req)) return fail(403, "Kaynak doğrulanamadı.");
  const a = await currentAuth();
  if (a.ok) return null;
  return a.reason === "login" ? fail(401, "Oturum gerekli.") : fail(403, "Parola tanımlı değil: ofis yalnızca localhost üzerinden açılır.");
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const text = await req.text();
    if (text.length > 20_000) return null;
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
