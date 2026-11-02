import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { BoatIcon } from "@/components/BoatIcon";
import { FancySelect } from "@/components/FancySelect";
import { filterBoats, type Filters } from "@/lib/data";
import { getBoats, getCategories, getDestinations } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const s = one(v);
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const field = "w-full appearance-none rounded-xl border border-navy/10 bg-mist px-3.5 py-3 text-sm font-medium text-navy outline-none transition focus:border-turquoise focus:bg-white focus:ring-2 focus:ring-turquoise/25";
const lab = "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy/50";
const chip = "cursor-pointer select-none rounded-full border border-navy/10 bg-white px-4 py-2 text-sm font-medium text-navy/75 transition hover:border-turquoise/60 peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-turquoise/40";

const PATHS = {
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z",
  users: "M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20M10 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1.5a3.5 3.5 0 00-2.5-3.35M15.5 4.6a3.5 3.5 0 010 6.8",
  bed: "M3 19V6M3 15h18v4M21 15v-3a3 3 0 00-3-3h-7v6M7 12.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
  chev: "M6 9l6 6 6-6",
  x: "M6 6l12 12M18 6L6 18",
};
function Ic({ d, className = "" }: { d: string; className?: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}><path d={d} /></svg>;
}

// Seçenekli düğme grubu (radyo): seçili olan lacivert dolu görünür.
function Pills({ name, value, options }: { name: string; value?: string; options: [string, string][] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <label key={v || "_"} className="relative">
          <input type="radio" name={name} value={v} defaultChecked={(value ?? "") === v} className="peer sr-only" />
          <span className={chip}>{label}</span>
        </label>
      ))}
    </div>
  );
}

export async function BoatsListView({ lang, sp }: { lang: Lang; sp: SP }) {
  const L = t(lang);
  const en = lang === "en";
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
  const [{ boats: all, sample }, destinations, categories] = await Promise.all([getBoats(lang), getDestinations(lang), getCategories(lang)]);
  const list = filterBoats(all, f);
  const hasDates = Boolean(one(sp.giris) || one(sp.cikis));
  const base = href(lang, "/tekneler");

  // Seçili filtreler: her biri tek dokunuşla kaldırılabilir
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) { const s = one(v); if (s) params[k] = s; }
  const without = (key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key];
    const q = new URLSearchParams(Object.entries(params).filter(([k]) => !keys.includes(k)));
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const destName = destinations.find((d) => d.slug === f.destinasyon)?.name;
  const eur = (n: number) => `€${n.toLocaleString(en ? "en-GB" : "tr-TR")}`;
  const active: [string, string | string[]][] = [];
  if (f.destinasyon) active.push([destName ?? f.destinasyon, "destinasyon"]);
  if (f.tip) active.push([f.tip, "tip"]);
  if (f.misafir) active.push([en ? `${f.misafir}+ guests` : `${f.misafir}+ misafir`, "misafir"]);
  if (f.kabin) active.push([en ? `${f.kabin}+ cabins` : `${f.kabin}+ kabin`, "kabin"]);
  if (f.min !== undefined || f.max !== undefined) active.push([`${f.min !== undefined ? eur(f.min) : "€0"} – ${f.max !== undefined ? eur(f.max) : "∞"}`, ["min", "max"]]);
  if (f.uzunluk) active.push([`${f.uzunluk}+ m`, "uzunluk"]);
  if (f.yil) active.push([en ? `Built ${f.yil}+` : `${f.yil} ve sonrası`, "yil"]);
  if (f.kiralama) active.push([f.kiralama === "gunluk" ? L.fDaily : L.fWeekly, "kiralama"]);
  if (f.kaptan) active.push([f.kaptan === "kaptanli" ? L.fWithCaptain : L.fNoCaptain, "kaptan"]);
  if (f.murettebat) active.push([f.murettebat === "var" ? L.fWithCrew : L.fNoCrew, "murettebat"]);
  const moreCount = [f.kabin, f.min ?? f.max, f.uzunluk, f.yil, f.kiralama, f.kaptan, f.murettebat].filter((x) => x !== undefined).length;

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        {/* Başlık: diğer sayfalarla aynı lacivert dalgalı alan */}
        <section className="relative isolate overflow-hidden pb-36 pt-28 text-white lg:pb-44 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={wrap}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{L.listEyebrow}</p>
            <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] lg:text-6xl">{L.listTitle}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 lg:text-lg">
              {en ? "Pick a port, boat type and group size; refine with price, length and crew whenever you like." : "Liman, yat tipi ve kişi sayınızı seçin; dilerseniz fiyat, uzunluk ve mürettebatla daraltın."}
            </p>
          </div>
        </section>

        <div className={`${wrap} relative z-10 -mt-28 lg:-mt-32`}>
          <form id="boat-filter" method="get" action={base} className="rounded-3xl bg-white p-5 shadow-2xl shadow-navy/15 ring-1 ring-navy/5 lg:p-7">
            {/* Ana sayfadaki aramadan gelen tarihler kaybolmasın */}
            {one(sp.giris) && <input type="hidden" name="giris" value={one(sp.giris)} />}
            {one(sp.cikis) && <input type="hidden" name="cikis" value={one(sp.cikis)} />}

            {/* Yat tipi: ikonlu kartlar */}
            <p className={lab}>{L.fType}</p>
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              {[{ slug: "all", name: L.all, value: "" }, ...categories.map((c) => ({ slug: c.slug, name: c.name, value: c.name }))].map((c) => (
                <label key={c.slug} className="relative shrink-0 snap-start">
                  <input type="radio" name="tip" value={c.value} defaultChecked={(f.tip ?? "") === c.value} className="peer sr-only" />
                  <span className="flex min-w-[6.5rem] cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-navy/10 bg-mist px-4 py-3 text-center text-xs font-semibold text-navy/70 transition hover:border-turquoise/60 peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-turquoise/40">
                    <BoatIcon name={c.slug} className="h-6 w-6" />
                    {c.name}
                  </span>
                </label>
              ))}
            </div>

            {/* Liman, misafir, kabin ve gönder */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
              <div>
                <label className={lab} htmlFor="destinasyon">{L.fDest}</label>
                <FancySelect
                  id="destinasyon" name="destinasyon" title={L.fDest} defaultValue={f.destinasyon ?? ""}
                  icon={<Ic d={PATHS.pin} />}
                  options={[{ value: "", label: en ? "All ports" : "Tüm limanlar", note: String(all.length) }, ...destinations.map((d) => ({ value: d.slug, label: d.name, note: String(all.filter((b) => b.destinations.includes(d.slug)).length) }))]}
                />
              </div>
              <div>
                <label className={lab} htmlFor="misafir">{L.fGuests}</label>
                <div className="relative">
                  <Ic d={PATHS.users} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-turquoise-dark" />
                  <input id="misafir" name="misafir" type="number" min={1} inputMode="numeric" placeholder={en ? "e.g. 8" : "örn. 8"} defaultValue={f.misafir ?? ""} className={`${field} pl-10`} />
                </div>
              </div>
              <div>
                <label className={lab} htmlFor="kabin">{L.fCabins}</label>
                <div className="relative">
                  <Ic d={PATHS.bed} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-turquoise-dark" />
                  <input id="kabin" name="kabin" type="number" min={0} inputMode="numeric" placeholder={en ? "e.g. 4" : "örn. 4"} defaultValue={f.kabin ?? ""} className={`${field} pl-10`} />
                </div>
              </div>
              <button type="submit" className="h-[46px] rounded-xl bg-turquoise px-7 text-sm font-semibold text-navy shadow-lg shadow-turquoise/25 transition hover:brightness-110 sm:col-span-2 lg:col-span-1">
                {en ? "Show boats" : "Yatları göster"}
              </button>
            </div>

            {/* Detaylı filtreler */}
            <details className="group mt-5 border-t border-navy/10 pt-4" open={moreCount > 0 || undefined}>
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
                <Ic d={PATHS.sliders} className="text-turquoise-dark" />
                {en ? "More filters" : "Detaylı filtreler"}
                {moreCount > 0 && <span className="rounded-full bg-turquoise px-2 py-0.5 text-[0.7rem] font-bold text-navy">{moreCount}</span>}
                <Ic d={PATHS.chev} className="ml-auto text-navy/40 transition group-open:rotate-180" />
              </summary>

              <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-2">
                <div>
                  <p className={lab}>{en ? "Price range (EUR)" : "Fiyat aralığı (EUR)"}</p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy/40">€</span>
                      <input aria-label={L.fMin} name="min" type="number" min={0} inputMode="numeric" placeholder={en ? "Min" : "En az"} defaultValue={f.min ?? ""} className={`${field} pl-8`} />
                    </div>
                    <span className="text-navy/30">—</span>
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy/40">€</span>
                      <input aria-label={L.fMax} name="max" type="number" min={0} inputMode="numeric" placeholder={en ? "Max" : "En çok"} defaultValue={f.max ?? ""} className={`${field} pl-8`} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-navy/45">{L.priceNote}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lab} htmlFor="uzunluk">{L.fLength}</label>
                    <input id="uzunluk" name="uzunluk" type="number" min={0} inputMode="numeric" placeholder={en ? "e.g. 20" : "örn. 20"} defaultValue={f.uzunluk ?? ""} className={field} />
                  </div>
                  <div>
                    <label className={lab} htmlFor="yil">{L.fYear}</label>
                    <input id="yil" name="yil" type="number" min={1990} inputMode="numeric" placeholder={en ? "e.g. 2015" : "örn. 2015"} defaultValue={f.yil ?? ""} className={field} />
                  </div>
                </div>
                <div>
                  <p className={lab}>{L.fRental}</p>
                  <Pills name="kiralama" value={f.kiralama} options={[["", L.fBoth], ["gunluk", L.fDaily], ["haftalik", L.fWeekly]]} />
                </div>
                <div>
                  <p className={lab}>{L.fCaptain}</p>
                  <Pills name="kaptan" value={f.kaptan} options={[["", L.fAny], ["kaptanli", L.fWithCaptain], ["kaptansiz", L.fNoCaptain]]} />
                </div>
                <div>
                  <p className={lab}>{L.fCrew}</p>
                  <Pills name="murettebat" value={f.murettebat} options={[["", L.fAny], ["var", L.fWithCrew], ["yok", L.fNoCrew]]} />
                </div>
                <div className="flex items-end gap-3">
                  <button type="submit" className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-soft">{L.filter}</button>
                  <Link href={base} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy/60 ring-1 ring-navy/15 transition hover:text-navy">{L.clear}</Link>
                </div>
              </div>
            </details>
          </form>
        </div>

        <div className={`${wrap} pb-20 pt-8`}>
          {sample && <p className="mb-3 text-sm text-navy/50">{L.sampleHome}</p>}
          {hasDates && <p className="mb-4 rounded-xl bg-mist px-4 py-3 text-sm text-navy/70">{L.datesNote}</p>}

          {/* Sonuç sayısı, seçili filtreler ve sıralama */}
          <div className="flex flex-col gap-4 border-b border-navy/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 font-display text-xl font-semibold text-navy" aria-live="polite">{L.foundN(list.length)}</p>
              {active.map(([label, key]) => (
                <Link key={label} href={without(key)} className="inline-flex items-center gap-1.5 rounded-full bg-turquoise/10 py-1.5 pl-3.5 pr-2.5 text-xs font-semibold text-turquoise-dark transition hover:bg-turquoise/20" aria-label={`${label} — ${L.clear}`}>
                  {label}<Ic d={PATHS.x} className="h-3.5 w-3.5" />
                </Link>
              ))}
              {active.length > 1 && <Link href={base} className="text-xs font-semibold text-navy/50 underline-offset-4 hover:text-navy hover:underline">{en ? "Clear all" : "Tümünü temizle"}</Link>}
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm text-navy/60">
              <span>{L.fSort}</span>
              <FancySelect
                compact autoSubmit form="boat-filter" name="sirala" title={L.fSort} defaultValue={f.sirala ?? ""}
                options={[{ value: "", label: L.sRec }, { value: "fiyat-artan", label: L.sPriceAsc }, { value: "fiyat-azalan", label: L.sPriceDesc }, { value: "yeni", label: L.sNew }, { value: "uzunluk", label: L.sLength }]}
              />
            </div>
          </div>

          {list.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((b) => <BoatCard key={b.slug} b={b} lang={lang} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl bg-mist p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-turquoise-dark shadow-sm"><BoatIcon name="compass" className="h-7 w-7" /></span>
              <p className="mx-auto mt-4 max-w-md text-navy/70">{all.length === 0 ? L.noneYet : L.noMatch}</p>
              {all.length > 0 && <Link href={base} className="mt-5 inline-block rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white">{en ? "Clear filters" : "Filtreleri temizle"}</Link>}
            </div>
          )}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
