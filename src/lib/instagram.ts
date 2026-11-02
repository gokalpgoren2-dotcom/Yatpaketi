// Instagram (Instagram API with Instagram Login). Anahtar yoksa ya da hata olursa bölüm hiç görünmez.
export type IgItem = { id: string; type: "IMAGE" | "VIDEO"; url: string; thumb: string; link: string; time: string };

const API = "https://graph.instagram.com";
const token = () => (process.env.IG_ACCESS_TOKEN ?? "").trim();
export const igUser = () => (process.env.IG_USERNAME ?? "yatpaketi").replace(/^@/, "").trim();

async function list(edge: string, extra = ""): Promise<IgItem[]> {
  const t = token();
  if (!t) return [];
  try {
    const r = await fetch(`${API}/me/${edge}?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${edge === "stories" ? 20 : 8}${extra}&access_token=${t}`, { next: { revalidate: 300 } });
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
