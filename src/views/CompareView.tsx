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

function BoatHead({ b, lang }: { b: Boat; lang: Lang }) {
  return (
    <Link href={href(lang, `/tekneler/${b.slug}`)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
        {b.image ? <Photo src={b.image} alt={b.name} sizes="(min-width:1024px) 30vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <Placeholder hue={b.hue} className="h-full w-full" />}
      </div>
      <p className="font-display mt-3 text-xl font-bold text-navy group-hover:text-turquoise-dark">{b.name}</p>
      <p className="text-sm text-navy/60">{[b.type, b.port].filter(Boolean).join(" · ")}</p>
    </Link>
  );
}

export async function CompareView({ lang, a: sa, b: sb }: { lang: Lang; a?: string; b?: string }) {
  const en = lang === "en";
  const [{ boats }, curated, contact] = await Promise.all([getBoats(lang), getCurated(), getContact()]);
  const A = boats.find((x) => x.slug === sa);
  const B = boats.find((x) => x.slug === sb);
  const both = A && B && A.slug !== B.slug;
  const options = boats.map((x) => ({ slug: x.slug, name: x.name }));
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
  const cell = (win: boolean) => `p-3 align-top font-medium ${win ? "bg-emerald-50 text-emerald-900" : "text-navy"}`;

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium leading-tight lg:text-6xl">{en ? "Which yacht" : "Hangi tekne"}<br /><span className="text-turquoise">{en ? "is right for you?" : "size uygun?"}</span></h1>
            <p className="max-w-md border-white/25 text-white/80 lg:border-l lg:pl-6 lg:text-lg">{en ? "Pick two yachts and see how they compare on size, age, cabins, water sports and price, with our notes." : "İki tekne seçin; boy, yaş, kabin, su sporları ve fiyat açısından nasıl ayrıştıklarını notlarımızla birlikte görün."}</p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className={wrap}>
            <CompareSelect boats={options} a={A?.slug ?? ""} b={B?.slug ?? ""} lang={lang} />

            {!result && (
              <div className="mt-10">
                {featured.length > 0 && (
                  <>
                    <p className={`mb-4 ${eyebrow}`}>{en ? "Popular comparisons" : "Sık karşılaştırılanlar"}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {featured.map((c) => {
                        const x = boats.find((q) => q.slug === c.a)!, y = boats.find((q) => q.slug === c.b)!;
                        return (
                          <Link key={c.id} href={`${href(lang, "/tekne-karsilastir")}?a=${c.a}&b=${c.b}`} className="rounded-2xl bg-white p-5 ring-1 ring-navy/10 transition hover:ring-turquoise">
                            <p className="font-display text-xl font-bold text-navy">{x.name} <span className="text-turquoise-dark">{en ? "vs" : "karşı"}</span> {y.name}</p>
                            <p className="mt-1 text-sm text-navy/60">{x.length > 0 ? `${x.length} m` : ""}{x.year ? ` · ${x.year}` : ""} / {y.length > 0 ? `${y.length} m` : ""}{y.year ? ` · ${y.year}` : ""}</p>
                            <p className="mt-3 text-sm font-semibold text-turquoise-dark">{en ? "See comparison" : "Karşılaştırmayı gör"} →</p>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
                {(featured.length === 0 || A || B) && <p className="mt-2 rounded-3xl bg-mist p-8 text-center text-navy/70">{A || B ? (en ? `${(A ?? B)!.name} is selected. Now choose the second yacht above.` : `${(A ?? B)!.name} seçildi. Şimdi yukarıdan ikinci tekneyi seçin.`) : (en ? "Choose two yachts above to compare them." : "Karşılaştırmak için yukarıdan iki tekne seçin.")}</p>}
                <p className="mt-6 text-sm text-navy/60">{en ? "Tip: save yachts with the heart and compare them in " : "İpucu: Tekneleri kalple favorileyip "}<Link href={href(lang, "/favorilerim")} className="font-semibold text-turquoise-dark underline">{en ? "your saved list" : "favoriler sayfasında"}</Link>{en ? "." : " da karşılaştırabilirsiniz."}</p>
              </div>
            )}

            {result && both && (
              <div className="mt-10 space-y-10">
                <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-navy/10">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th className="w-28 p-3 sm:w-40" />
                        <th className="p-3 align-top font-normal"><BoatHead b={A} lang={lang} /></th>
                        <th className="p-3 align-top font-normal"><BoatHead b={B} lang={lang} /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((r) => (
                        <tr key={r.label} className="border-t border-navy/10">
                          <th scope="row" className="p-3 text-xs font-semibold uppercase tracking-wide text-navy/55">{r.label}</th>
                          <td className={cell(r.win === "a")}>{r.a}{r.win === "a" && <span className="ml-1 text-emerald-700" aria-label={en ? "better" : "daha iyi"}>✓</span>}</td>
                          <td className={cell(r.win === "b")}>{r.b}{r.win === "b" && <span className="ml-1 text-emerald-700" aria-label={en ? "better" : "daha iyi"}>✓</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-navy/10 p-3 text-xs text-navy/50">{en ? "✓ marks the stronger value in each row. Larger is not always better; it depends on your group and budget." : "✓ her satırda öne çıkan değeri gösterir. Büyük her zaman daha iyi demek değildir; grubunuza ve bütçenize bağlıdır."}</p>
                </div>

                <CompareInsights A={A} B={B} note={noteText} points={result.points} summary={result.summary} lang={lang} />

                <div className="flex flex-col gap-3 sm:flex-row">
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
