import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, loginAllowed, sameOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth";
import { fail, readJson } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Kaynak doğrulanamadı.");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!loginAllowed(ip)) return fail(429, "Çok fazla deneme. 10 dakika sonra tekrar deneyin.");
  const body = await readJson(req);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(password)) return fail(401, "Parola hatalı.");
  const res = NextResponse.json({ ok: true });
  const secure = new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions(secure));
  return res;
}
