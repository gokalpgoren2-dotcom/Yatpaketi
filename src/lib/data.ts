// GEÇİCİ ÖRNEK VERİ. Aşama 3'te Supabase'den okunacak; fiyatlar ve tekneler gerçek değildir.

export type Boat = {
  slug: string;
  name: string;
  type: string;
  port: string;
  guests: number;
  cabins: number;
  length: number;
  priceFrom: number | null; // null => "Fiyat sorunuz"
  currency: "EUR" | "TRY" | "USD";
  unit: "gün" | "hafta";
  hue: number; // yer tutucu görsel rengi
};

export const categories = [
  "Gulet",
  "Motoryat",
  "Katamaran",
  "Yelkenli",
  "Trawler",
  "Lüks Yat",
  "Günlük Tekneler",
];

export const destinations = [
  { slug: "gocek", name: "Göcek", blurb: "12 Ada ve sakin koylar", hue: 190 },
  { slug: "bodrum", name: "Bodrum", blurb: "Gece hayatı ve Ege esintisi", hue: 205 },
  { slug: "fethiye", name: "Fethiye", blurb: "Ölüdeniz ve Kelebekler Vadisi", hue: 180 },
  { slug: "marmaris", name: "Marmaris", blurb: "Orhaniye ve Hisarönü koyları", hue: 215 },
  { slug: "antalya", name: "Antalya", blurb: "Kekova ve Akdeniz'in turkuazı", hue: 175 },
];

export const boats: Boat[] = [
  { slug: "ornek-gulet-1", name: "Örnek Gulet 1", type: "Gulet", port: "Göcek", guests: 12, cabins: 6, length: 28, priceFrom: 4500, currency: "EUR", unit: "hafta", hue: 195 },
  { slug: "ornek-motoryat-1", name: "Örnek Motoryat 1", type: "Motoryat", port: "Bodrum", guests: 8, cabins: 4, length: 22, priceFrom: null, currency: "EUR", unit: "gün", hue: 210 },
  { slug: "ornek-katamaran-1", name: "Örnek Katamaran 1", type: "Katamaran", port: "Fethiye", guests: 10, cabins: 5, length: 14, priceFrom: 3200, currency: "EUR", unit: "hafta", hue: 185 },
  { slug: "ornek-yelkenli-1", name: "Örnek Yelkenli 1", type: "Yelkenli", port: "Marmaris", guests: 6, cabins: 3, length: 13, priceFrom: 2100, currency: "EUR", unit: "hafta", hue: 200 },
  { slug: "ornek-luks-yat-1", name: "Örnek Lüks Yat 1", type: "Lüks Yat", port: "Bodrum", guests: 10, cabins: 5, length: 35, priceFrom: null, currency: "EUR", unit: "hafta", hue: 220 },
  { slug: "ornek-gunluk-1", name: "Örnek Günlük Tekne 1", type: "Günlük", port: "Göcek", guests: 14, cabins: 0, length: 16, priceFrom: 450, currency: "EUR", unit: "gün", hue: 178 },
];

export const routes = [
  { name: "Göcek – 12 Ada", days: "7 gün", stops: "Tersane, Cleopatra, Kapı Creek" },
  { name: "Bodrum – Datça", days: "7 gün", stops: "Karaada, Knidos, Gökova" },
  { name: "Fethiye – Kekova", days: "7 gün", stops: "Kaş, Kekova, Kaleköy" },
];

export const posts = [
  { title: "Mavi Yolculukta İlk Kez Neler Beklemeli?", tag: "Rehber" },
  { title: "Göcek'te Mutlaka Görülmesi Gereken 5 Koy", tag: "Destinasyon" },
  { title: "Gulet mi Katamaran mı? Hangisi Size Uygun?", tag: "İpuçları" },
];
