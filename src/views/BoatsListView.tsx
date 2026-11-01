import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { filterBoats, type Filters } from "@/lib/data";
import { getBoats, getCategoryNames, getDestinations } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const s = one(v);
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const input = "w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export async function BoatsListView({ lang, sp }: { lang: Lang; sp: SP }) {
  const L = t(lang);
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
  const [{ boats: all, sample }, destinations, categories] = await Promise.all([getBoats(lang), getDestinations(lang), getCategoryNames(lang)]);
  const list = filterBoats(all, f);
  const hasDates = Boolean(one(sp.giris) || one(sp.cikis));

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{L.listEyebrow}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{L.listTitle}</h1>
        {sample && <p className="mt-3 text-sm text-navy/50">{L.sampleHome}</p>}

        {hasDates && (
          <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-navy/70">
            {L.datesNote}
          </p>
        )}

        <form method="get" action={href(lang, "/tekneler")} className="mt-8 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ana sayfadaki aramadan gelen tarihler kaybolmasın */}
          {one(sp.giris) && <input type="hidden" name="giris" value={one(sp.giris)} />}
          {one(sp.cikis) && <input type="hidden" name="cikis" value={one(sp.cikis)} />}
          <div><label className={lab} htmlFor="destinasyon">{L.fDest}</label>
            <select id="destinasyon" name="destinasyon" defaultValue={f.destinasyon ?? ""} className={input}>
              <option value="">{L.all}</option>
              {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="tip">{L.fType}</label>
            <select id="tip" name="tip" defaultValue={f.tip ?? ""} className={input}>
              <option value="">{L.all}</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div><label className={lab} htmlFor="misafir">{L.fGuests}</label>
            <input id="misafir" name="misafir" type="number" min={1} inputMode="numeric" defaultValue={f.misafir ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="kabin">{L.fCabins}</label>
            <input id="kabin" name="kabin" type="number" min={0} inputMode="numeric" defaultValue={f.kabin ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="min">{L.fMin}</label>
            <input id="min" name="min" type="number" min={0} inputMode="numeric" defaultValue={f.min ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="max">{L.fMax}</label>
            <input id="max" name="max" type="number" min={0} inputMode="numeric" defaultValue={f.max ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="uzunluk">{L.fLength}</label>
            <input id="uzunluk" name="uzunluk" type="number" min={0} inputMode="numeric" defaultValue={f.uzunluk ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="yil">{L.fYear}</label>
            <input id="yil" name="yil" type="number" min={1990} inputMode="numeric" defaultValue={f.yil ?? ""} className={input} /></div>
          <div><label className={lab} htmlFor="kiralama">{L.fRental}</label>
            <select id="kiralama" name="kiralama" defaultValue={f.kiralama ?? ""} className={input}>
              <option value="">{L.fBoth}</option><option value="gunluk">{L.fDaily}</option><option value="haftalik">{L.fWeekly}</option>
            </select></div>
          <div><label className={lab} htmlFor="kaptan">{L.fCaptain}</label>
            <select id="kaptan" name="kaptan" defaultValue={f.kaptan ?? ""} className={input}>
              <option value="">{L.fAny}</option><option value="kaptanli">{L.fWithCaptain}</option><option value="kaptansiz">{L.fNoCaptain}</option>
            </select></div>
          <div><label className={lab} htmlFor="murettebat">{L.fCrew}</label>
            <select id="murettebat" name="murettebat" defaultValue={f.murettebat ?? ""} className={input}>
              <option value="">{L.fAny}</option><option value="var">{L.fWithCrew}</option><option value="yok">{L.fNoCrew}</option>
            </select></div>
          <div><label className={lab} htmlFor="sirala">{L.fSort}</label>
            <select id="sirala" name="sirala" defaultValue={f.sirala ?? ""} className={input}>
              <option value="">{L.sRec}</option><option value="fiyat-artan">{L.sPriceAsc}</option><option value="fiyat-azalan">{L.sPriceDesc}</option>
              <option value="yeni">{L.sNew}</option><option value="uzunluk">{L.sLength}</option>
            </select></div>
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className="rounded-xl bg-turquoise px-6 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">{L.filter}</button>
            <Link href={href(lang, "/tekneler")} className="rounded-xl border border-navy/15 px-6 py-3 text-sm font-medium text-navy">{L.clear}</Link>
          </div>
        </form>
        <p className="mt-3 text-xs text-navy/50">{L.priceNote}</p>

        <p className="mt-8 text-sm font-medium text-navy" aria-live="polite">{L.foundN(list.length)}</p>
        {list.length > 0 ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => <BoatCard key={b.slug} b={b} lang={lang} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-mist p-8 text-center text-navy/70">
            {all.length === 0 ? L.noneYet : L.noMatch}
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
