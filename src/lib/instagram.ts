// Instagram (Instagram API with Instagram Login). Anahtar yoksa ya da hata olursa bölüm hiç görünmez.
// Erişim anahtarı Yönetim > Ayarlar'dan girilir ve gizli tabloda (private_settings) saklanır;
// 60 günde sona ermemesi için site, haftada bir anahtarı kendiliğinden yeniler.
import { createClient } from "@supabase/supabase-js";

export type IgItem = { id: string; type: "IMAGE" | "VIDEO"; url: string; thumb: string; link: string; time: string };

const API = "https://graph.instagram.com";
export const igUser = () => (process.env.IG_USERNAME ?? "yatpaketi").replace(/^@/, "").trim();

type Saved = { token?: string; refreshed_at?: string; username?: string; ig_id?: string };

// Meta'nın yeni "Unified login" akışı EAA… ile başlayan, süresi dolmayan sistem kullanıcısı anahtarı verir;
// bu anahtar graph.facebook.com üzerinden, Instagram işletme hesabının kimliğiyle kullanılır.
const FB = "https://graph.facebook.com/v21.0";
const isFb = (t: string) => t.startsWith("EAA");

async function fbIgAccount(t: string): Promise<{ id?: string; username?: string; message?: string }> {
  const tries = [
    `${FB}/me/accounts?fields=instagram_business_account{id,username}&limit=50&access_token=${encodeURIComponent(t)}`,
    `${FB}/me/assigned_pages?fields=instagram_business_account{id,username}&limit=50&access_token=${encodeURIComponent(t)}`,
  ];
  let message: string | undefined;
  for (const u of tries) {
    try {
      const r = await fetch(u, { cache: "no-store" });
      const j = (await r.json()) as { data?: { instagram_business_account?: { id: string; username?: string } }[]; error?: { message?: string } };
      if (j.error?.message) message = j.error.message;
      const want = igUser().toLowerCase();
      const all = (j.data ?? []).map((p) => p.instagram_business_account).filter(Boolean) as { id: string; username?: string }[];
      const hit = all.find((a) => a.username?.toLowerCase() === want) ?? all[0];
      if (hit) return hit;
    } catch (e) {
      message = e instanceof Error ? e.message : message;
    }
  }
  return { message: message ?? "Anahtara bağlı Instagram işletme hesabı bulunamadı." };
}

function serviceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function readSaved(): Promise<Saved> {
  try {
    const db = serviceDb();
    if (!db) return {};
    const { data } = await db.from("private_settings").select("value").eq("key", "instagram").maybeSingle();
    return (data?.value ?? {}) as Saved;
  } catch {
    return {};
  }
}

// Kayıtlı anahtar 7 günden eskiyse yeniler (Instagram anahtarları 60 gün geçerlidir).
async function freshToken(): Promise<string> {
  const saved = await readSaved();
  const t = (saved.token ?? "").trim() || (process.env.IG_ACCESS_TOKEN ?? "").trim();
  if (!saved.token || isFb(t)) return t;
  const age = Date.now() - new Date(saved.refreshed_at ?? 0).getTime();
  if (age < 7 * 86400000) return t;
  try {
    const r = await fetch(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(t)}`, { cache: "no-store" });
    if (r.ok) {
      const j = (await r.json()) as { access_token?: string };
      if (j.access_token) {
        await serviceDb()?.from("private_settings").upsert({ key: "instagram", value: { ...saved, token: j.access_token, refreshed_at: new Date().toISOString() }, updated_at: new Date().toISOString() });
        return j.access_token;
      }
    }
  } catch { /* yenilenemezse mevcut anahtar kullanılır */ }
  return t;
}

async function list(edge: string): Promise<IgItem[]> {
  const t = await freshToken();
  if (!t) return [];
  try {
    let base = `${API}/me`;
    if (isFb(t)) {
      const saved = await readSaved();
      const id = saved.ig_id || (await fbIgAccount(t)).id;
      if (!id) return [];
      base = `${FB}/${id}`;
    }
    const r = await fetch(`${base}/${edge}?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${edge === "stories" ? 20 : 8}&access_token=${t}`, { next: { revalidate: 300 } });
    if (!r.ok) return [];
    const j = (await r.json()) as { data?: Record<string, string>[] };
    return (j.data ?? [])
      .filter((m) => m.media_url && (m.media_type === "IMAGE" || m.media_type === "VIDEO" || m.media_type === "CAROUSEL_ALBUM"))
      .map((m) => ({
        id: m.id,
        type: m.media_type === "VIDEO" ? "VIDEO" : "IMAGE",
        url: m.media_url,
        thumb: m.thumbnail_url || m.media_url,
        link: m.permalink,
        time: m.timestamp,
      }));
  } catch {
    return [];
  }
}

export const getStories = () => list("stories");
export const getPosts = () => list("media");

// Yönetim > Ayarlar için: anahtarı dener, hesabı döndürür.
export async function igCheck(token: string): Promise<{ ok: boolean; username?: string; igId?: string; message?: string }> {
  if (isFb(token)) {
    const a = await fbIgAccount(token);
    return a.id ? { ok: true, username: a.username, igId: a.id } : { ok: false, message: a.message };
  }
  try {
    const r = await fetch(`${API}/me?fields=user_id,username&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
    const j = (await r.json()) as { username?: string; error?: { message?: string } };
    if (!r.ok || !j.username) return { ok: false, message: j.error?.message ?? `Instagram yanıtı: ${r.status}` };
    return { ok: true, username: j.username };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Bağlantı hatası" };
  }
}

export async function igStatus(): Promise<{ connected: boolean; username?: string; refreshedAt?: string; source: "db" | "env" | "none" }> {
  const saved = await readSaved();
  if (saved.token) return { connected: true, username: saved.username, refreshedAt: saved.refreshed_at, source: "db" };
  if ((process.env.IG_ACCESS_TOKEN ?? "").trim()) return { connected: true, source: "env" };
  return { connected: false, source: "none" };
}
