import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { CompareSelect } from "@/components/CompareSelect";
import { CompareInsights } from "@/components/CompareInsights";
import { getBoats, getContact } from "@/lib/content";
import { priceLabel, type Boat } from "@/lib/data";
import { buildPoints, compareRows, getCurated, samePair } from "@/lib/compare";
import { href, type Lang } from "@/lib/i18n";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

function BoatHead({ b, lang, tag }: { b: Boat; lang: Lang; tag: string }) {
  return (
    <Link href={href(lang, `/tekneler/${b.slug}`)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
        {b.image ? <Photo src={b.image} alt={b.name} sizes="(min-width:1024px) 30vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <Placeholder hue={b.hue} className="h-full w-full" />}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-navy/80 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-turquoise backdrop-blur">{tag}</span>
      </div>
      <p className="font-display mt-3 text-lg font-semibold leading-tight text-navy group-hover:text-turquoise-dark lg:text-xl">{b.name}</p>
      <p className="mt-0.5 text-xs text-navy/55 lg:text-sm">{[b.type, b.port].filter(Boolean).join(" · ")}</p>
    </Link>
  );
}

export async function CompareView({ lang, a: sa, b: sb }: { lang: Lang; a?: string; b?: string }) {
  const en = lang === "en";
  const [{ boats }, curated, contact] = await Promise.all([getBoats(lang), getCurated(), getContact()]);
  const A = boats.find((x) => x.slug === sa);
  const B = boats.find((x) => x.slug === sb);
  const both = A && B && A.slug !== B.slug;
  const options = boats.map((x) => ({ slug: x.slug, name: x.name, type: x.type, port: x.port, length: x.length, guests: x.guests, image: x.image ?? null, hue: x.hue }));
  const note = both ? curated.find((c) => samePair(c, A.slug, B.slug)) : undefined;
  const noteText = note ? ((en ? note.noteEn?.trim() : "") || note.note) : "";
  const featured = curated.filter((c) => c.featured && boats.some((x) => x.slug === c.a) && boats.some((x) => x.slug === c.b));
  const askPrice = en ? "Ask for price" : "Fiyat sorunuz";
  const result = both ? { rows: compareRows(A, B, lang, (x) => priceLabel(x, lang), askPrice), ...buildPoints(A, B, lang) } : null;
  const origin = "https://yatpaketi.com";
  const wa = both && contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(en
        ? `Hello, I'm comparing ${A.name} and ${B.name}. Could you help me choose?\n${origin}${href(lang, `/tekneler/${A.slug}`)}\n${origin}${href(lang, `/tekneler/${B.slug}`)}\n\nMy dates: `
        : `Merhaba, ${A.name} ile ${B.name} teknelerini karşılaştırıyorum. Seçmeme yardımcı olur musunuz?\n${origin}${href(lang, `/tekneler/${A.slug}`)}\n${origin}${href(lang, `/tekneler/${B.slug}`)}\n\nTarihlerim: `)}`
    : "";

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="relative isolate overflow-hidden pb-36 pt-28 text-white lg:pb-44 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{en ? "Yacht comparison" : "Tekne karşılaştırma"}</p>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] lg:text-6xl">{en ? "Which yacht" : "Hangi tekne"}<br /><span className="text-turquoise">{en ? "is right for you?" : "size uygun?"}</span></h1>
            </div>
            <p className="max-w-md text-white/75 lg:border-l lg:border-white/20 lg:pl-6 lg:text-lg">{en ? "Pick two yachts and see how they compare on size, age, cabins, water sports and price, with our notes." : "İki tekne seçin; boy, yaş, kabin, su sporları ve fiyat açısından nasıl ayrıştıklarını notlarımızla birlikte görün."}</p>
          </div>
        </section>

        <section className="pb-16 lg:pb-24">
          <div className={wrap}>
            <div className="relative z-10 -mt-28 rounded-3xl bg-white p-4 shadow-2xl shadow-navy/15 ring-1 ring-navy/5 sm:p-6 lg:-mt-32 lg:p-8">
              <CompareSelect boats={options} a={A?.slug ?? ""} b={B?.slug ?? ""} lang={lang} />
            </div>

            {!result && (
              <div className="mt-12">
                {featured.length > 0 && (
                  <>
                    <p className={`mb-4 ${eyebrow}`}>{en ? "Popular comparisons" : "Sık karşılaştırılanlar"}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {featured.map((c) => {
                        const x = boats.find((q) => q.slug === c.a)!, y = boats.find((q) => q.slug === c.b)!;
                        return (
                          <Link key={c.id} href={`${href(lang, "/tekne-karsilastir")}?a=${c.a}&b=${c.b}#sonuc`} className="group flex items-center gap-4 rounded-3xl bg-white p-3 pr-5 ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/10 hover:ring-turquoise">
                            <span className="relative flex shrink-0">
                              {[x, y].map((v, i) => (
                                <span key={v.slug} className={`relative block h-16 w-16 overflow-hidden rounded-2xl ring-4 ring-white sm:h-20 sm:w-20 ${i ? "-ml-5" : ""}`}>
                                  {v.image ? <Photo src={v.image} alt="" sizes="80px" className="object-cover" /> : <Placeholder hue={v.hue} label={false} className="h-full w-full" />}
                                </span>
                              ))}
                              <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-[0.6rem] font-bold uppercase text-turquoise ring-2 ring-white">vs</span>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-display block text-base font-semibold leading-snug text-navy lg:text-lg">{x.name} <span className="text-navy/35">/</span> {y.name}</span>
                              <span className="mt-0.5 block text-xs text-navy/55">{x.length > 0 ? `${x.length} m` : ""}{x.year ? ` · ${x.year}` : ""} <span className="text-navy/30">/</span> {y.length > 0 ? `${y.length} m` : ""}{y.year ? ` · ${y.year}` : ""}</span>
                              <span className="mt-2 block text-sm font-semibold text-turquoise-dark">{en ? "See comparison" : "Karşılaştırmayı gör"} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
                {(featured.length === 0 || A || B) && <p className="mt-6 rounded-3xl bg-mist p-8 text-center text-navy/70">{A || B ? (en ? `${(A ?? B)!.name} is selected. Now choose the second yacht above.` : `${(A ?? B)!.name} seçildi. Şimdi yukarıdan ikinci tekneyi seçin.`) : (en ? "Choose two yachts above to compare them." : "Karşılaştırmak için yukarıdan iki tekne seçin.")}</p>}
                <p className="mt-6 text-sm text-navy/60">{en ? "Tip: save yachts with the heart and compare them in " : "İpucu: Tekneleri kalple favorileyip "}<Link href={href(lang, "/favorilerim")} className="font-semibold text-turquoise-dark underline">{en ? "your saved list" : "favoriler sayfasında"}</Link>{en ? "." : " da karşılaştırabilirsiniz."}</p>
              </div>
            )}

            {result && both && (
              <div id="sonuc" className="mt-12 scroll-mt-28 space-y-10">
                <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy/5 ring-1 ring-navy/10">
                  <div className="relative grid grid-cols-2 gap-3 p-3 sm:gap-6 sm:p-6">
                    <BoatHead b={A} lang={lang} tag="A" />
                    <BoatHead b={B} lang={lang} tag="B" />
                    <span className="absolute left-1/2 top-[calc(0.75rem+18%)] flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase tracking-widest text-turquoise shadow-lg ring-4 ring-white sm:top-[calc(1.5rem+19%)] sm:h-14 sm:w-14">vs</span>
                  </div>
                  <dl>
                    {result.rows.map((r, i) => (
                      <div key={r.label} className={`border-t border-navy/10 ${i % 2 ? "bg-mist/60" : ""}`}>
                        <dt className="px-3 pt-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy/45 sm:px-6">{r.label}</dt>
                        <div className="grid grid-cols-2 gap-3 px-3 pb-3 pt-1.5 sm:gap-6 sm:px-6">
                          {(["a", "b"] as const).map((k) => (
                            <dd key={k} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-sm font-semibold ${r.win === k ? "bg-turquoise/15 text-navy" : "text-navy/75"}`}>
                              {r[k]}
                              {r.win === k && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-turquoise-dark" aria-label={en ? "better" : "daha iyi"}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                            </dd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </dl>
                  <p className="border-t border-navy/10 px-4 py-3 text-xs text-navy/50 sm:px-6">{en ? "✓ marks the stronger value in each row. Larger is not always better; it depends on your group and budget." : "✓ her satırda öne çıkan değeri gösterir. Büyük her zaman daha iyi demek değildir; grubunuza ve bütçenize bağlıdır."}</p>
                </div>

                <CompareInsights A={A} B={B} note={noteText} points={result.points} summary={result.summary} lang={lang} />

                <div className="flex flex-col gap-3 rounded-3xl bg-mist p-5 sm:flex-row sm:items-center sm:p-6">
                  {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white hover:brightness-95">{en ? "Ask us which one to pick" : "Hangisini seçeceğinizi bize sorun"}</a>}
                  <Link href={href(lang, `/tekneler/${A.slug}`)} className="inline-flex items-center justify-center rounded-full border border-navy/20 px-6 py-3.5 text-base font-semibold text-navy">{A.name}</Link>
                  <Link href={href(lang, `/tekneler/${B.slug}`)} className="inline-flex items-center justify-center rounded-full border border-navy/20 px-6 py-3.5 text-base font-semibold text-navy">{B.name}</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
