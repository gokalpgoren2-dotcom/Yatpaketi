import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { priceLabel } from "@/lib/data";
import { getBoatBySlug, getContact, getDestinations } from "@/lib/content";
import { RequestPanel } from "@/components/RequestPanel";
import { href, t, type Lang } from "@/lib/i18n";
import { localizeEquipment, localizeToy } from "@/lib/boatOptions";

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy/10 py-3 text-sm">
      <dt className="text-navy/60">{k}</dt>
      <dd className="text-right font-medium text-navy">{v}</dd>
    </div>
  );
}

export async function BoatView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const [{ boat: b, all: boats, sample }, destinations, contact] = await Promise.all([getBoatBySlug(slug, lang), getDestinations(lang), getContact()]);
  if (!b) notFound();
  const price = priceLabel(b, lang);
  const regions = destinations.filter((d) => b.destinations.includes(d.slug));
  const gallery = b.images ?? [];
  const similar = boats.filter((x) => x.slug !== b.slug && (x.type === b.type || x.destinations.some((d) => b.destinations.includes(d)))).slice(0, 3);

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <nav className="mb-4 text-sm text-navy/60" aria-label={L.breadcrumb}>
          <Link href={href(lang, "/tekneler")} className="hover:text-turquoise">{L.navBoats}</Link> / {b.name}
        </nav>
        <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{[b.type, b.port].filter(Boolean).join(" · ")}</p>
        <h1 className="font-display mt-1 text-3xl font-medium text-navy lg:text-5xl">{b.name}</h1>
        {sample && <p className="mt-2 text-sm text-navy/50">{L.sampleBoat}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3 lg:hidden">
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${price ? "bg-navy text-white" : "bg-mist text-turquoise-dark"}`}>{price ?? L.askPrice}</span>
          <a href="#talep" className="rounded-full bg-turquoise px-5 py-2 text-sm font-semibold text-white">{L.sendRequest}</a>
        </div>

        {gallery.length > 0 ? (
          <div className="mt-8 space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist lg:aspect-[16/8]">
              <Photo src={gallery[0]} alt={b.name} priority sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" />
            </div>
            {gallery.length > 1 && (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {gallery.slice(1).map((src, i) => (
                  <li key={src}>
                    <a href={src} target="_blank" rel="noopener" className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-mist">
                      <Photo src={src} alt={`${b.name} ${L.photoN(i + 2)}`} sizes="(min-width:1024px) 16vw, 33vw" className="object-cover transition hover:scale-105" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
            <Placeholder hue={b.hue} className="aspect-[16/10] rounded-2xl" />
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[12, 24, 36].map((o) => <Placeholder key={o} hue={b.hue + o} className="aspect-[4/3] rounded-2xl lg:aspect-auto lg:h-full" label={false} />)}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            {b.description && (
              <>
                <h2 className="font-display text-2xl text-navy">{L.about}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-navy/70">{b.description}</p>
              </>
            )}

            <h2 className="font-display mt-10 text-2xl text-navy">{L.specs}</h2>
            <dl className="mt-3 grid gap-x-10 sm:grid-cols-2">
              <Spec k={L.sType} v={b.type || L.notStated} />
              <Spec k={L.sBrand} v={`${b.brand} ${b.model}`.trim() || L.notStated} />
              <Spec k={L.sYear} v={b.year ? String(b.year) : L.notStated} />
              <Spec k={L.sRefit} v={b.refit ? String(b.refit) : L.notStated} />
              <Spec k={L.sLen} v={b.length > 0 ? `${b.length} m` : L.notStated} />
              <Spec k={L.sWidth} v={b.width > 0 ? `${b.width} m` : L.notStated} />
              <Spec k={L.sCabins} v={String(b.cabins)} />
              <Spec k={L.sCap} v={String(b.guests)} />
              <Spec k={L.sCrew} v={b.crew > 0 ? L.crewN(b.crew) : L.noCrew} />
              <Spec k={L.sCaptain} v={b.captained ? L.included : L.notIncluded} />
              <Spec k={L.sPort} v={b.port || L.notStated} />
              <Spec k={L.sRegions} v={regions.map((r) => r.name).join(", ") || L.notStated} />
            </dl>

            {b.equipment.length > 0 && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">{L.equipment}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {b.equipment.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{localizeEquipment(e, lang)}</li>)}
                </ul>
              </>
            )}
            {b.waterSports.length > 0 && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">{L.toys}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {b.waterSports.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{localizeToy(e, lang)}</li>)}
                </ul>
              </>
            )}

            <h2 className="font-display mt-10 text-2xl text-navy">{L.availability}</h2>
            <p className="mt-3 rounded-2xl bg-mist p-5 text-sm text-navy/70">{L.availText}</p>
          </div>

          <aside id="talep" className="h-fit scroll-mt-24 rounded-3xl border border-navy/10 bg-white p-6 shadow-xl shadow-navy/5 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{L.price}</p>
            <p className={`mt-1 text-2xl font-semibold ${price ? "text-navy" : "text-turquoise-dark"}`}>{price ?? L.askPrice}</p>
            {b.showPrice && b.priceDaily && b.priceWeekly && (
              <p className="mt-1 text-sm text-navy/60">{L.dailyPrice}: {b.priceDaily.toLocaleString(L.locale)} {b.currency}</p>
            )}
            <div className="mt-6 border-t border-navy/10 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-navy">{L.requestTitle}</h2>
              <RequestPanel boatSlug={b.slug} boatName={b.name} maxGuests={Math.max(b.guests, 1)} whatsapp={contact.whatsapp} lang={lang} />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-navy">{L.similar}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => <BoatCard key={s.slug} b={s} lang={lang} />)}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
