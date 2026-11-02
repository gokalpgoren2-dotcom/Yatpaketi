// Instagram (Instagram API with Instagram Login). Anahtar yoksa ya da hata olursa bölüm hiç görünmez.
// Erişim anahtarı Yönetim > Ayarlar'dan girilir ve gizli tabloda (private_settings) saklanır;
// 60 günde sona ermemesi için site, haftada bir anahtarı kendiliğinden yeniler.
import { createClient } from "@supabase/supabase-js";

export type IgItem = { id: string; type: "IMAGE" | "VIDEO"; url: string; thumb: string; link: string; time: string };

const API = "https://graph.instagram.com";
export const igUser = () => (process.env.IG_USERNAME ?? "yatpaketi").replace(/^@/, "").trim();

type Saved = { token?: string; refreshed_at?: string; username?: string };

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
  if (!saved.token) return t;
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
    const r = await fetch(`${API}/me/${edge}?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${edge === "stories" ? 20 : 8}&access_token=${t}`, { next: { revalidate: 300 } });
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
export async function igCheck(token: string): Promise<{ ok: boolean; username?: string; message?: string }> {
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
