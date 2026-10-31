import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { filterBoats, type Filters } from "@/lib/data";
import { getBoats, getCategoryNames, getDestinations } from "@/lib/content";

// Rezervasyon talep formu hazır olana kadar arama motorlarına kapalı.
export const metadata: Metadata = {
  title: "Kiralık Tekneler",
  description: "Gulet, motoryat, katamaran ve yelkenli seçeneklerini filtreleyin.",
  alternates: { canonical: "/tekneler" },
  robots: { index: false, follow: true },
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const s = one(v);
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const input = "w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export const revalidate = 60;

export default async function BoatsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const f: Filters = {
    destinasyon: one(sp.destinasyon),
    tip: one(sp.tip),
    misafir: num(sp.misafir),
    kabin: num(sp.kabin),
    uzunluk: num(sp.uzunluk),
    yil: num(sp.yil),
    min: num(sp.min),
    max: num(sp.max),
    kiralama: (["gunluk", "haftalik"] as const).find((x) => x === one(sp.kiralama)),
    kaptan: (["kaptanli", "kaptansiz"] as const).find((x) => x === one(sp.kaptan)),
    murettebat: (["var", "yok"] as const).find((x) => x === one(sp.murettebat)),
    sirala: one(sp.sirala),
  };
  const [{ boats: all, sample }, destinations, categories] = await Promise.all([getBoats(), getDestinations(), getCategoryNames()]);
  const list = filterBoats(all, f);
  const hasDates = Boolean(one(sp.giris) || one(sp.cikis));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">Kiralık Tekneler</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">Size Uygun Tekneyi Bulun</h1>
        {sample && <p className="mt-3 text-sm text-navy/50">Örnek içerik: Veritabanı bağlı olmadığı için örnek tekneler gösteriliyor.</p>}

        {hasDates && (
          <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-navy/70">
            Tarih bazlı müsaitlik henüz kullanılamıyor, sonuçlar tarihe göre filtrelenmedi. Müsaitlik takvimi sonraki aşamada eklenecek.
          </p>
        )}

        <form method="get" action="/tekneler" className="mt-8 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ana sayfadaki aramadan gelen tarihler kaybolmasın */}
          {one(sp.giris) && <input type="hidden" name="giris" value={one(sp.giris)} />}
          {one(sp.cikis) && <input type="hidden" name="cikis" value={one(sp.cikis)} />}
          <div><label className={lab} htmlFor="destinasyon">Destinasyon</label>
            <select id="destinasyon" name="destinasyon" defaultValue={f.destinasyon ?? ""} className={input}>
              <option value="">Tümü</option>
              {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="tip">Tekne tipi</label>
            <select id="tip" name="tip" defaultValue={f.tip ?? ""} className={input}>
              <option value="">Tümü</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="misafir">Misafir (en az)</label>
            <input id="misafir" name="misafir" type="number" min={1} inputMode="numeric" defaultValue={f.misafir ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="kabin">Kabin (en az)</label>
            <input id="kabin" name="kabin" type="number" min={0} inputMode="numeric" defaultValue={f.kabin ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="min">En düşük fiyat</label>
            <input id="min" name="min" type="number" min={0} inputMode="numeric" defaultValue={f.min ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="max">En yüksek fiyat</label>
            <input id="max" name="max" type="number" min={0} inputMode="numeric" defaultValue={f.max ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="uzunluk">Uzunluk (en az, m)</label>
            <input id="uzunluk" name="uzunluk" type="number" min={0} inputMode="numeric" defaultValue={f.uzunluk ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="yil">Yapım yılı (en az)</label>
            <input id="yil" name="yil" type="number" min={1990} inputMode="numeric" defaultValue={f.yil ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="kiralama">Kiralama</label>
            <select id="kiralama" name="kiralama" defaultValue={f.kiralama ?? ""} className={input}>
              <option value="">Günlük ve haftalık</option><option value="gunluk">Günlük</option><option value="haftalik">Haftalık</option>
            </select></div>
          <div><label className={lab} htmlFor="kaptan">Kaptan</label>
            <select id="kaptan" name="kaptan" defaultValue={f.kaptan ?? ""} className={input}>
              <option value="">Fark etmez</option><option value="kaptanli">Kaptanlı</option><option value="kaptansiz">Kaptansız</option>
            </select></div>
          <div><label className={lab} htmlFor="murettebat">Mürettebat</label>
            <select id="murettebat" name="murettebat" defaultValue={f.murettebat ?? ""} className={input}>
              <option value="">Fark etmez</option><option value="var">Mürettebatlı</option><option value="yok">Mürettebatsız</option>
            </select></div>
          <div><label className={lab} htmlFor="sirala">Sıralama</label>
            <select id="sirala" name="sirala" defaultValue={f.sirala ?? ""} className={input}>
              <option value="">Önerilen</option><option value="fiyat-artan">En düşük fiyat</option><option value="fiyat-azalan">En yüksek fiyat</option>
              <option value="yeni">En yeni eklenen</option><option value="uzunluk">Tekne uzunluğu</option>
            </select></div>
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className="rounded-xl bg-turquoise px-6 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">Filtrele</button>
            <Link href="/tekneler" className="rounded-xl border border-navy/15 px-6 py-3 text-sm font-medium text-navy">Temizle</Link>
          </div>
        </form>
        <p className="mt-3 text-xs text-navy/50">Fiyat filtresi EUR, haftalık fiyat üzerinden çalışır (günlük kiralama seçiliyse günlük fiyat). “Fiyat sorunuz” teknelerinde fiyat filtresi uygulanamaz.</p>

        <p className="mt-8 text-sm font-medium text-navy" aria-live="polite">{list.length} tekne bulundu</p>
        {list.length > 0 ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => <BoatCard key={b.slug} b={b} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-mist p-8 text-center text-navy/70">
            {all.length === 0 ? "Henüz yayında tekne yok." : "Bu filtrelere uygun tekne bulunamadı. Filtreleri gevşetmeyi deneyin."}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
