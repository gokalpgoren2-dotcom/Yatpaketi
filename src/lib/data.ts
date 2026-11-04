// GEÇİCİ ÖRNEK VERİ. Aşama 3'te Supabase'den okunacak. Yatlar, fiyatlar ve açıklamalar gerçek değildir.

import { minDaily, money, off } from "./pricing";

export type Offer = { kind: "early" | "discount"; percent: number; until: string };

export type Boat = {
  rating?: { avg: number; count: number } | null; // onaylı yorumların ortalaması
  offer?: Offer | null; // geçerli kampanya (Admin > Kampanyalar)
  slug: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number | null;
  refit: number | null;
  port: string;
  destinations: string[]; // destinasyon slug'ları
  guests: number;
  cabins: number;
  crew: number;
  length: number;
  width: number;
  captained: boolean; // kaptan dahil
  priceDaily: number | null;
  priceWeekly: number | null;
  monthly?: Partial<Record<number, number>>; // ay (4–11) -> günlük fiyat
  weekly?: Partial<Record<number, number>>; // ay (4–11) -> haftalık fiyat (farklıysa)
  included?: string[]; // fiyata dahil olanlar
  excluded?: string[]; // fiyata dahil olmayanlar
  vatMode?: "none" | "included" | "excluded"; // KDV dahil / hariç
  vatRate?: number; // KDV oranı (%)
  brochure?: string | null; // yat tanıtım PDF adresi
  apa?: number; // APA yüzdesi (5/15/20/30/35/40), yoksa 0
  showPrice: boolean; // false => "Fiyat sorunuz"
  currency: "EUR" | "TRY" | "USD";
  equipment: string[];
  waterSports: string[];
  description: string;
  hue: number; // yer tutucu görsel rengi
  addedAt: string;
  image?: string | null; // kapak fotoğrafı adresi (Supabase Storage); yoksa yer tutucu
  images?: string[]; // tüm fotoğraflar (kapak ilk sırada)
  featured?: boolean;
};

export type Destination = { slug: string; name: string; blurb: string; hue: number; intro: string; image?: string | null; seoTitle?: string; seoDescription?: string };

export const categories = [
  "Motoryat",
  "Gulet",
  "Yelkenli / Katamaran",
  "Lüks Yat",
];

export const destinations: Destination[] = [
  { slug: "gocek", name: "Göcek", blurb: "12 Ada ve sakin koylar", hue: 190, intro: "Göcek, korunaklı koyları ve 12 Ada rotasıyla mavi yolculuğun en bilinen çıkış noktalarından biridir." },
  { slug: "bodrum", name: "Bodrum", blurb: "Gece hayatı ve Ege esintisi", hue: 205, intro: "Bodrum çıkışlı rotalar Datça, Gökova ve Yunan adalarına uzanır." },
  { slug: "fethiye", name: "Fethiye", blurb: "Ölüdeniz ve Kelebekler Vadisi", hue: 180, intro: "Fethiye, Ölüdeniz ve çevresindeki koylarla hem günlük hem haftalık rotalara uygundur." },
  { slug: "marmaris", name: "Marmaris", blurb: "Orhaniye ve Hisarönü koyları", hue: 215, intro: "Marmaris, Orhaniye ve Hisarönü koyları ile Datça Yarımadası rotalarının çıkış noktasıdır." },
];

const eq = ["Klima", "Jeneratör", "Güneşlenme alanı", "Tender bot", "Wi-Fi"];
const ws = ["Deniz kanosu", "Paddle board", "Şnorkel takımı"];

export const boats: Boat[] = [
  { slug: "ornek-gulet-1", name: "Örnek Gulet 1", type: "Gulet", brand: "Örnek Tersane", model: "Aegean 28", year: 2018, refit: 2023, port: "Göcek", destinations: ["gocek", "fethiye"], guests: 12, cabins: 6, crew: 4, length: 28, width: 7, captained: true, priceDaily: null, priceWeekly: 4500, showPrice: true, currency: "EUR", equipment: eq, waterSports: ws, description: "Örnek içerik: Geniş güverteli, altı kabinli klasik gulet.", hue: 195, addedAt: "2026-09-01" },
  { slug: "ornek-motoryat-1", name: "Örnek Motoryat 1", type: "Motoryat", brand: "Örnek Marin", model: "MY 22", year: 2020, refit: null, port: "Bodrum", destinations: ["bodrum"], guests: 8, cabins: 4, crew: 2, length: 22, width: 5.5, captained: true, priceDaily: 1800, priceWeekly: null, showPrice: false, currency: "EUR", equipment: eq, waterSports: ws, description: "Örnek içerik: Hızlı ve konforlu motoryat.", hue: 210, addedAt: "2026-09-10" },
  { slug: "ornek-katamaran-1", name: "Örnek Katamaran 1", type: "Katamaran", brand: "Örnek Cat", model: "Cat 45", year: 2021, refit: null, port: "Fethiye", destinations: ["fethiye", "gocek"], guests: 10, cabins: 5, crew: 2, length: 14, width: 7.5, captained: true, priceDaily: null, priceWeekly: 3200, showPrice: true, currency: "EUR", equipment: eq, waterSports: ws, description: "Örnek içerik: Geniş salonlu, stabil katamaran.", hue: 185, addedAt: "2026-09-18" },
  { slug: "ornek-yelkenli-1", name: "Örnek Yelkenli 1", type: "Yelkenli / Katamaran", brand: "Örnek Sail", model: "Sloop 13", year: 2016, refit: 2022, port: "Marmaris", destinations: ["marmaris"], guests: 6, cabins: 3, crew: 0, length: 13, width: 4.2, captained: false, priceDaily: null, priceWeekly: 2100, showPrice: true, currency: "EUR", equipment: ["Jeneratör", "Tender bot", "GPS"], waterSports: ["Şnorkel takımı"], description: "Örnek içerik: Kaptansız kiralanabilen yelkenli.", hue: 200, addedAt: "2026-09-25" },
  { slug: "ornek-luks-yat-1", name: "Örnek Lüks Yat 1", type: "Lüks Yat", brand: "Örnek Yachts", model: "Superyacht 35", year: 2022, refit: null, port: "Bodrum", destinations: ["bodrum", "marmaris"], guests: 10, cabins: 5, crew: 6, length: 35, width: 8, captained: true, priceDaily: null, priceWeekly: 18000, showPrice: false, currency: "EUR", equipment: [...eq, "Jakuzi", "Şef"], waterSports: [...ws, "Jet ski"], description: "Örnek içerik: Tam mürettebatlı lüks yat.", hue: 220, addedAt: "2026-10-02" },
  { slug: "ornek-gunluk-1", name: "Örnek Günlük Yat 1", type: "Günlük Yatlar", brand: "Örnek Tur", model: "Gulet 16", year: 2019, refit: null, port: "Göcek", destinations: ["gocek"], guests: 14, cabins: 0, crew: 2, length: 16, width: 4.8, captained: true, priceDaily: 450, priceWeekly: null, showPrice: true, currency: "EUR", equipment: ["Güneşlenme alanı", "Müzik sistemi", "Yemek servisi"], waterSports: ["Şnorkel takımı", "Deniz kanosu"], description: "Örnek içerik: Günübirlik koy turu yatı.", hue: 178, addedAt: "2026-10-08" },
  { slug: "ornek-trawler-1", name: "Örnek Trawler 1", type: "Trawler", brand: "Örnek Trawler", model: "Trawler 18", year: 2017, refit: 2021, port: "Marmaris", destinations: ["marmaris"], guests: 6, cabins: 3, crew: 2, length: 18, width: 5, captained: true, priceDaily: 900, priceWeekly: 5400, showPrice: true, currency: "EUR", equipment: eq, waterSports: ws, description: "Örnek içerik: Ekonomik yakıt tüketimli trawler.", hue: 170, addedAt: "2026-10-15" },
  { slug: "ornek-gulet-2", name: "Örnek Gulet 2", type: "Gulet", brand: "Örnek Tersane", model: "Bodrum 24", year: 2014, refit: 2020, port: "Bodrum", destinations: ["bodrum", "marmaris"], guests: 10, cabins: 5, crew: 3, length: 24, width: 6.5, captained: true, priceDaily: null, priceWeekly: 3800, showPrice: true, currency: "EUR", equipment: eq, waterSports: ws, description: "Örnek içerik: Geleneksel hatlı, beş kabinli gulet.", hue: 192, addedAt: "2026-10-20" },
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

export function boatsFor(list: Boat[], destSlug: string) {
  return list.filter((b) => b.destinations.includes(destSlug));
}

// Fiyat gösterimi (vitrin): en düşük günlük fiyat. showPrice false ya da fiyat yoksa null ("Fiyat sorunuz").
export function priceLabel(b: Boat, lang: "tr" | "en" = "tr"): string | null {
  const base = minDaily(b);
  if (base == null) return null;
  const v = off(base, b.offer?.percent); // geçerli kampanya varsa indirimli
  return lang === "en" ? `from ${money(v, b.currency, lang)} / day` : `${money(v, b.currency, lang)}’den / gün`;
}

// ---- Filtreleme ----
export type Filters = {
  destinasyon?: string; tip?: string; misafir?: number; kabin?: number; uzunluk?: number; yil?: number;
  min?: number; max?: number; kiralama?: "gunluk" | "haftalik"; kaptan?: "kaptanli" | "kaptansiz";
  murettebat?: "var" | "yok"; sirala?: string;
};

// Fiyat karşılaştırması: seçilen kiralama türüne göre; seçilmediyse haftalık fiyat (yoksa günlük x 7).
// Fiyatı gizli ("Fiyat sorunuz") yatlar fiyat filtresi açıkken listeden çıkar.
// Filtre ve sıralama için: en düşük günlük fiyat
function comparablePrice(b: Boat): number | null {
  return minDaily(b);
}

export function filterBoats(all: Boat[], f: Filters): Boat[] {
  let list = all.filter((b) => {
    if (f.destinasyon && !b.destinations.includes(f.destinasyon)) return false;
    if (f.tip && b.type !== f.tip) return false;
    if (f.misafir && b.guests < f.misafir) return false;
    if (f.kabin && b.cabins < f.kabin) return false;
    if (f.uzunluk && b.length < f.uzunluk) return false;
    if (f.yil && (b.year ?? 0) < f.yil) return false;
    if (f.kaptan === "kaptanli" && !b.captained) return false;
    if (f.kaptan === "kaptansiz" && b.captained) return false;
    if (f.murettebat === "var" && b.crew === 0) return false;
    if (f.murettebat === "yok" && b.crew > 0) return false;
    if (f.min !== undefined || f.max !== undefined) {
      const p = comparablePrice(b);
      if (p === null) return false;
      if (f.min !== undefined && p < f.min) return false;
      if (f.max !== undefined && p > f.max) return false;
    }
    return true;
  });
  const price = (b: Boat) => comparablePrice(b) ?? Number.POSITIVE_INFINITY;
  switch (f.sirala) {
    case "fiyat-artan": list = [...list].sort((a, b) => price(a) - price(b)); break;
    case "fiyat-azalan": list = [...list].sort((a, b) => (price(b) === Infinity ? -1 : price(b)) - (price(a) === Infinity ? -1 : price(a))); break;
    case "yeni": list = [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt)); break;
    case "uzunluk": list = [...list].sort((a, b) => b.length - a.length); break;
  }
  return list;
}
