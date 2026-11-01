// Bölge haritaları (public/haritalar). Destinasyon (bölge) yazılarında, yazıya özel kapak yoksa kullanılır.
const DEST: Record<string, string> = {
  "fethiye-korfezi-gocek": "gocek", "bodrum-gokova-korfezi": "bodrum", "datca-hisaronu-korfezi": "datca",
  "bozburun-sogut": "bozburun", "marmaris-ekincik": "marmaris", "kas-kekova": "kas",
};
export function regionMapFor(kind: string, slug: string): string | null {
  if (kind === "destination") return DEST[slug] ? `/haritalar/${DEST[slug]}.jpg` : null;
  return null;
}
