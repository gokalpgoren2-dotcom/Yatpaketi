import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { getConfig } from "./config";

// Parola + imzalı HttpOnly çerez. Parola tanımlı değilse ofis yalnızca localhost'tan açılır.

export const SESSION_COOKIE = "aio_session";
const MAX_AGE_S = 60 * 60 * 12;

const g = globalThis as unknown as { __aioEphemeralSecret?: string };
function secret() {
  const s = getConfig().sessionSecret;
  if (s.length >= 32) return s;
  // Gizli değer verilmemişse süreç ömrü boyunca geçerli rastgele bir değer kullanılır (yeniden başlatınca oturumlar düşer).
  g.__aioEphemeralSecret ??= randomBytes(32).toString("hex");
  return g.__aioEphemeralSecret;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function createSessionToken(now = Date.now()) {
  const payload = `v1.${now + MAX_AGE_S * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  if (!safeEq(sign(payload), token.slice(i + 1))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > now;
}

export function checkPassword(input: string) {
  const pw = getConfig().password;
  if (!pw) return false;
  // Uzunluk sızmasın diye iki tarafın özeti karşılaştırılır.
  const h = (s: string) => createHmac("sha256", "aio-pw").update(s).digest("hex");
  return safeEq(h(input), h(pw));
}

const isLocalHost = (host: string | null) => {
  const h = (host || "").replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
};

const isLoopback = (ip: string) => ip === "::1" || ip.replace(/^::ffff:/, "").startsWith("127.");

export type AuthResult = { ok: true } | { ok: false; reason: "login" | "locked" };

/** İstek ofise erişebilir mi */
export function authorize(host: string | null, cookieValue: string | undefined, forwardedFor?: string | null): AuthResult {
  if (getConfig().password) return verifySessionToken(cookieValue) ? { ok: true } : { ok: false, reason: "login" };
  // Parolasız kurulum: yalnızca bu makineden gelen istekler. İstemci adresi yerel değilse (ters vekil arkası) reddedilir.
  const clients = (forwardedFor || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (isLocalHost(host) && clients.every(isLoopback)) return { ok: true };
  return { ok: false, reason: "locked" };
}

/** Durum değiştiren isteklerde kaynak kontrolü (CSRF) */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export const sessionCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure,
  path: "/",
  maxAge: MAX_AGE_S,
});

// Basit giriş denemesi sınırı (bellek içi): IP başına 10 dakikada 8 deneme.
const attempts = new Map<string, { n: number; reset: number }>();
export function loginAllowed(key: string, now = Date.now()) {
  const a = attempts.get(key);
  if (!a || a.reset < now) {
    attempts.set(key, { n: 1, reset: now + 10 * 60_000 });
    return true;
  }
  a.n += 1;
  return a.n <= 8;
}
