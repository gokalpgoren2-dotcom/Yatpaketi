// "Kapalı mod": Yönetim > Ayarlar'dan açılınca ziyaretçiler yalnızca "Çok yakında" sayfasını görür.
// Ekip, yönetim paneline giriş yaptığı (ya da ekip şifresini girdiği) cihazlarda siteyi normal görür.
// Hem ara katmanda (edge) hem sunucuda çalışır; yalnızca Web Crypto kullanır.
export const GATE_COOKIE = "yp_ekip";
export const GATE_MAX_AGE = 60 * 60 * 24 * 60; // 60 gün

let token: string | null = null;
// Çerezin değeri: tahmin edilemesin diye gizli sunucu anahtarından türetilir (anahtarın kendisi çereze yazılmaz).
export async function gateToken(): Promise<string> {
  if (token) return token;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "yatpaketi";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("yp-gate:" + secret));
  token = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return token;
}

let memo: { closed: boolean; at: number } | null = null;
// Sitenin kapalı olup olmadığı; her istekte veritabanına gitmemek için 20 sn bellekte tutulur.
// Okunamazsa son bilinen değer, o da yoksa "açık" kabul edilir.
export async function gateClosed(): Promise<boolean> {
  if (memo && Date.now() - memo.at < 20000) return memo.closed;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const r = await fetch(`${url}/rest/v1/site_settings?key=eq.gate&select=value`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!r.ok) return memo?.closed ?? false;
    const j = (await r.json()) as { value?: { closed?: boolean } }[];
    memo = { closed: !!j[0]?.value?.closed, at: Date.now() };
    return memo.closed;
  } catch {
    return memo?.closed ?? false;
  }
}
