import { NextResponse } from "next/server";
import { sameOrigin, SESSION_COOKIE } from "@/server/auth";
import { fail } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Kaynak doğrulanamadı.");
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
