import type { Contact } from "@/lib/content";

// Sosyal medya bağlantıları (Yönetim > Ayarlar'dan girilir). Boş olan görünmez.
export const SOCIAL_ICONS: Record<string, string> = {
  instagram: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM17.5 6.5h.01",
  tiktok: "M9 18a3 3 0 11-3-3M9 18V4h4a5 5 0 005 5",
  linkedin: "M4 9h4v11H4zM6 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11 9h4v2c.6-1.2 2-2.2 3.5-2.2 2.2 0 3.5 1.4 3.5 4.2v7h-4v-6.2c0-1.3-.6-2-1.6-2-1.1 0-1.4.9-1.4 2V20h-4z",
};
export const SOCIAL_NAMES: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", linkedin: "LinkedIn" };

export function socialList(c: Contact): [string, string][] {
  return (["instagram", "tiktok", "linkedin"] as const).map((k) => [k, c[k]] as [string, string]).filter(([, u]) => Boolean(u));
}

export function SocialLinks({ c, tone = "light", labels = false }: { c: Contact; tone?: "light" | "dark"; labels?: boolean }) {
  const list = socialList(c);
  if (!list.length) return null;
  const cls = tone === "light"
    ? "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white hover:text-navy"
    : "bg-white text-navy ring-1 ring-navy/10 hover:ring-turquoise hover:text-turquoise-dark";
  return (
    <div className="flex flex-wrap gap-2.5">
      {list.map(([k, url]) => (
        <a key={k} href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_NAMES[k]} title={SOCIAL_NAMES[k]} className={`inline-flex items-center gap-2 rounded-full transition ${labels ? "px-4 py-2.5 text-sm font-semibold" : "h-10 w-10 justify-center"} ${cls}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={SOCIAL_ICONS[k]} /></svg>
          {labels && SOCIAL_NAMES[k]}
        </a>
      ))}
    </div>
  );
}
