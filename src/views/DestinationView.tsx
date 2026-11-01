import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Photo } from "@/components/Photo";
import { Scroller } from "@/components/Scroller";
import { PortArt } from "@/components/PortArt";
import { RichText } from "@/components/RichText";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";
import { getPortPhotos } from "@/lib/site-texts";
import { getReviews } from "@/lib/reviews";
import { ReviewSection } from "@/components/Reviews";
import { href, t, type Lang } from "@/lib/i18n";

export async function DestinationView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const [destinations, { boats, sample }] = await Promise.all([getDestinations(lang), getBoats(lang)]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const list = boatsFor(boats, d.slug);
  const reviews = await getReviews({ boatSlugs: list.map((b) => b.slug), limit: 9 });

  const photos = await getPortPhotos(d.slug);
  const en = lang === "en";
  const chip = "rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur";
  const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="pb-20">
        <section className="relative isolate overflow-hidden bg-navy">
          <PortArt slug={d.slug} className="block h-[26rem] w-full lg:h-[34rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-navy/30" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-9 text-white lg:px-8 lg:pb-14">
            <Link href={href(lang, "/limanlar")} className="text-sm text-white/80 hover:text-white">← {en ? "All ports" : "Tüm limanlar"}</Link>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-medium leading-tight lg:text-6xl">{L.destHero(d.name)}</h1>
            <p className="mt-3 max-w-2xl text-lg text-white/85">{d.blurb}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className={chip}>{en ? `${list.length} yachts` : `${list.length} tekne`}</span>
              {reviews.length > 0 && <span className={chip}>{en ? `${reviews.length} guest reviews` : `${reviews.length} misafir yorumu`}</span>}
              <span className={chip}>{en ? "Departure port" : "Çıkış limanı"}</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
            <div>
              <p className={`mb-3 ${eyebrow}`}>{en ? `About ${d.name}` : `${d.name} hakkında`}</p>
              {d.intro ? <div className="max-w-3xl"><RichText text={d.intro} /></div> : <p className="text-navy/60">{L.destNone}</p>}
            </div>
            <aside className="h-fit rounded-3xl bg-gradient-to-br from-navy to-[#0b4a66] p-7 text-white lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{en ? "Plan your trip" : "Planınızı yapalım"}</p>
              <h2 className="font-display mt-3 text-2xl leading-snug">{en ? `Looking for a yacht from ${d.name}?` : `${d.name} çıkışlı tekne mi arıyorsunuz?`}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{en ? "Tell us your dates and group size, we'll suggest the right yacht." : "Tarihlerinizi ve kişi sayınızı yazın, size uygun tekneyi önerelim."}</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} className="rounded-full bg-turquoise px-6 py-3 text-center text-sm font-semibold text-navy transition hover:brightness-110">{en ? "See yachts" : "Tekneleri gör"}</Link>
                <Link href={href(lang, "/iletisim")} className="rounded-full px-6 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{en ? "Write to us" : "Bize yazın"}</Link>
              </div>
            </aside>
          </div>

          {photos.length > 0 && (
            <section className="mt-14">
              <p className={`mb-3 ${eyebrow}`}>{en ? "Gallery" : "Galeri"}</p>
              <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] lg:grid-cols-4 lg:gap-4">
                {photos.map((src, i) => (
                  <div key={src} className={`relative overflow-hidden rounded-2xl bg-mist lg:rounded-3xl ${i === 0 && photos.length > 2 ? "col-span-2 row-span-2" : ""}`}>
                    <Photo src={src} alt={`${d.name} ${i + 1}`} sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="object-cover transition duration-500 hover:scale-105" />
                  </div>
                ))}
              </div>
            </section>
          )}
          {sample && <p className="mt-6 text-sm text-navy/50">{L.sampleData}</p>}

          <div className="mt-14 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-navy lg:text-3xl">{L.destBoats(d.name)}</h2>
            <Link href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} className="shrink-0 text-sm font-medium text-turquoise-dark">{L.filter}</Link>
          </div>
          {list.length > 0 ? (
            <div className="mt-6">
              <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                {list.map((b) => (
                  <div key={b.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><BoatCard b={b} lang={lang} /></div>
                ))}
              </Scroller>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-mist p-8 text-navy/70">{L.destNone}</p>
          )}
          <ReviewSection reviews={reviews} lang={lang} showBoat title={en ? `Guest reviews from ${d.name}` : `${d.name} çıkışlı misafir yorumları`} />
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
