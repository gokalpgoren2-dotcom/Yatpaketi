// Bölge haritaları (public/haritalar). Destinasyon ve rota yazılarında, yazıya özel kapak yoksa kullanılır.
const DEST: Record<string, string> = {
  "fethiye-korfezi-gocek": "gocek", "bodrum-gokova-korfezi": "bodrum", "datca-hisaronu-korfezi": "datca",
  "bozburun-sogut": "bozburun", "marmaris-ekincik": "marmaris", "kas-kekova": "kas",
};
export function regionMapFor(kind: string, slug: string): string | null {
  if (kind === "destination") return DEST[slug] ? `/haritalar/${DEST[slug]}.jpg` : null;
  if (kind !== "route") return null;
  // Rotalar ilk durağına göre bölge haritasını alır.
  let key: string | null = null;
  if (slug.startsWith("marmaris-hisaronu")) key = "datca";
  else if (/^(gocek|fethiye)/.test(slug)) key = "gocek";
  else if (/^(kekova|kas)/.test(slug)) key = "kas";
  else if (slug.startsWith("marmaris")) key = "marmaris";
  else if (slug.startsWith("bozburun")) key = "bozburun";
  else if (slug.startsWith("datca")) key = "datca";
  else if (slug.startsWith("bodrum")) key = "bodrum";
  return key ? `/haritalar/${key}.jpg` : null;
}
