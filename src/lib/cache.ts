import { unstable_cache } from "next/cache";

// Herkese açık içerik okumalarını 60 sn önbellekte tutar: her sayfa açılışında veritabanına gidilmez.
// Panelden yapılan değişiklikler en geç 1 dakika içinde sitede görünür (sayfaların yenilenme süresiyle aynı).
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string): (...args: A) => Promise<R> {
  return unstable_cache(fn, ["yp", key], { revalidate: 60, tags: ["icerik"] });
}
