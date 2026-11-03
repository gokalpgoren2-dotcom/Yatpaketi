import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { priceLabel } from "@/lib/data";
import { SEASON_MONTHS, dailyFor, minDaily, money, monthName, off, vatNote, weeklyFor } from "@/lib/pricing";
import { offerLabel, offerUntil } from "@/lib/campaigns";
import { getReviews } from "@/lib/reviews";
import { FavButton } from "@/components/FavButton";
import { RatingLine, ReviewSection } from "@/components/Reviews";
import { getBoatBySlug, getContact, getDestinations } from "@/lib/content";
import { RequestPanel } from "@/components/RequestPanel";
import { BoatGallery } from "@/components/BoatGallery";
import { parseEquipment } from "@/lib/boatOptions";
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
  const reviews = await getReviews({ boatSlugs: [b.slug] });
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
        {b.rating && <a href="#yorumlar" className="mt-2 inline-block"><RatingLine rating={b.rating} lang={lang} /></a>}
        {sample && <p className="mt-2 text-sm text-navy/50">{L.sampleBoat}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <FavButton slug={b.slug} name={b.name} lang={lang} label className="rounded-full border border-navy/20 px-4 py-2 text-navy hover:border-[#e8453c]" />
          <Link href={`${href(lang, "/tekne-karsilastir")}?a=${b.slug}`} className="inline-flex items-center rounded-full bg-turquoise/10 px-4 py-2 text-sm font-semibold text-turquoise-dark hover:bg-turquoise/20">{lang === "en" ? "Compare with another yacht →" : "Başka yatla karşılaştır →"}</Link>
        </div>

        {gallery.length > 0 ? (
          <BoatGallery images={gallery} name={b.name} lang={lang} badge={b.offer ? <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-[#e8453c] px-4 py-1.5 text-sm font-bold text-white shadow">{offerLabel(b.offer, lang)}</span> : undefined} />
        ) : (
          <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
            <Placeholder hue={b.hue} className="aspect-[16/10] rounded-2xl" />
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[12, 24, 36].map((o) => <Placeholder key={o} hue={b.hue + o} className="aspect-[4/3] rounded-2xl lg:aspect-auto lg:h-full" label={false} />)}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[2fr_1fr] lg:gap-10">
          <div>
            {/* Öne çıkan özellikler: telefonda fotoğrafların hemen altında */}
            {(() => {
              const en = lang === "en";
              const acRaw = b.equipment.find((e) => /^klima|air.?cond/i.test(parseEquipment(e).name));
              const acD = acRaw ? parseEquipment(acRaw).detail.toLocaleLowerCase("tr") : "";
              const acH = acD.match(/(\d{1,2})\s*saat/)?.[1];
              const ac = !acRaw ? (en ? "No" : "Yok") : /24\s*saat|7\s*\/\s*24|tam gün/.test(acD) ? "7/24" : acH ? (en ? `${acH} h/day` : `${acH} sa/gün`) : (en ? "Yes" : "Var");
              const items: [string, string][] = [
                [en ? "Length" : "Boy", b.length > 0 ? `${b.length} m` : "–"],
                [en ? "Cabins" : "Kabin", b.cabins > 0 ? String(b.cabins) : "–"],
                [en ? "Guests" : "Misafir", String(b.guests)],
                [en ? "Crew" : "Personel", b.crew > 0 ? String(b.crew) : "–"],
                [en ? "Built/Refit" : "Yapım/Refit", b.year ? `${b.year}${b.refit ? ` (${b.refit})` : ""}` : "–"],
                [en ? "A/C" : "Klima", ac],
              ];
              return (
                <ul className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {items.map(([k, v]) => (
                    <li key={k} className="rounded-2xl bg-mist px-2 py-3 text-center ring-1 ring-navy/5">
                      <span className="block text-[15px] font-semibold leading-tight text-navy">{v}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-navy/45">{k}</span>
                    </li>
                  ))}
                </ul>
              );
            })()}

            {b.brochure && (
              <a href={b.brochure} target="_blank" rel="noopener" download className="-mt-4 mb-8 flex items-center justify-center gap-2 rounded-2xl border border-navy/15 px-4 py-3 text-sm font-semibold text-navy lg:hidden">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 3h7l5 5v13H7zM14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5" /></svg>
                {lang === "en" ? "Download yacht brochure (PDF)" : "Tanıtım dosyasını indir (PDF)"}
              </a>
            )}
            {/* Telefonda kısa fiyat özeti: ayrıntılar ve tarih seçimi aşağıdaki kutuda */}
            <a href="#talep" className={`mb-8 flex items-center justify-between gap-3 rounded-2xl p-4 ring-1 lg:hidden ${b.offer && minDaily(b) != null ? "bg-[#fff1ee] ring-[#e8453c]/20" : "bg-white ring-navy/10 shadow-sm"}`}>
              <span>
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-navy/45">{lang === "en" ? "Daily from" : "Günlük, başlayan"}</span>
                {minDaily(b) != null ? (
                  <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                    <span className={`font-display text-2xl font-semibold ${b.offer ? "text-[#c0332b]" : "text-navy"}`}>{money(off(minDaily(b)!, b.offer?.percent), b.currency, lang)}</span>
                    {b.offer && <span className="text-xs text-navy/45 line-through">{money(minDaily(b)!, b.currency, lang)}</span>}
                    {vatNote(b, lang) && <span className="text-xs font-semibold text-navy/55">{vatNote(b, lang)}</span>}
                  </span>
                ) : (
                  <span className="mt-0.5 block text-lg font-semibold text-turquoise-dark">{L.askPrice}</span>
                )}
              </span>
              <span className="shrink-0 rounded-full bg-turquoise px-4 py-2.5 text-sm font-semibold text-white">{lang === "en" ? "Get price ↓" : "Fiyat hesapla ↓"}</span>
            </a>

            <h2 className="font-display text-2xl text-navy">{L.specs}</h2>
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

            {((b.included?.length ?? 0) > 0 || (b.excluded?.length ?? 0) > 0) && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">{lang === "en" ? "What's included" : "Fiyata dahil olanlar"}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(b.included?.length ?? 0) > 0 && (
                    <div className="rounded-2xl bg-emerald-50/60 p-5 ring-1 ring-emerald-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">{lang === "en" ? "Included" : "Dahil"}</p>
                      <ul className="mt-3 space-y-2">
                        {b.included!.map((x) => <li key={x} className="flex items-start gap-2.5 text-sm text-navy"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>{x}</li>)}
                      </ul>
                    </div>
                  )}
                  {(b.excluded?.length ?? 0) > 0 && (
                    <div className="rounded-2xl bg-mist p-5 ring-1 ring-navy/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/55">{lang === "en" ? "Not included" : "Dahil değil"}</p>
                      <ul className="mt-3 space-y-2">
                        {b.excluded!.map((x) => <li key={x} className="flex items-start gap-2.5 text-sm text-navy/75"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy/15 text-navy/60"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg></span>{x}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

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

            {b.description && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">{L.about}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-navy/70">{b.description}</p>
              </>
            )}
          </div>

          <aside id="talep" className="h-fit scroll-mt-24 rounded-3xl border border-navy/10 bg-white p-5 shadow-xl shadow-navy/5 sm:p-6 lg:sticky lg:top-28">
            {(() => {
              const from = minDaily(b);
              const pct = b.offer?.percent ?? 0;
              if (from == null) return (
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy/45">{L.price}</p>
                  <p className="mt-1 text-2xl font-semibold text-turquoise-dark">{L.askPrice}</p>
                </div>
              );
              return pct ? (
                <div className="-m-2 rounded-2xl bg-gradient-to-br from-[#fff1ee] to-white p-4 ring-1 ring-[#e8453c]/20">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#e8453c] px-3 py-1 text-sm font-bold text-white shadow">{offerLabel(b.offer!, lang)}</span>
                  </p>
                  <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#c0332b]">{lang === "en" ? "Discounted daily price" : "İndirimli günlük fiyat"}</p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-4xl font-semibold leading-none text-[#c0332b]">{money(off(from, pct), b.currency, lang)}</span>
                    <span className="text-sm text-navy/55">{lang === "en" ? "/ day from" : "’den başlayan"}</span>
                  </p>
                  <p className="mt-1 text-sm text-navy/45"><span className="line-through">{money(from, b.currency, lang)}</span> {lang === "en" ? "regular price" : "normal fiyat"}</p>
                  {offerUntil(b.offer!, lang) && <p className="mt-2 text-xs font-semibold text-[#c0332b]">{offerUntil(b.offer!, lang)}</p>}
                </div>
              ) : (
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy/45">{lang === "en" ? "Daily price" : "Günlük fiyat"}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold leading-none text-navy">{money(from, b.currency, lang)}</span>
                    <span className="text-sm text-navy/55">{lang === "en" ? "/ day from" : "’den başlayan"}</span>
                  </p>
                </div>
              );
            })()}
            {vatNote(b, lang) && <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${b.vatMode === "excluded" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{vatNote(b, lang)}</p>}
            {/* Aylara göre günlük fiyatlar */}
            {price && (() => {
              const pct = b.offer?.percent ?? 0;
              return (
                <div className="mt-5">
                  <ul className="grid grid-cols-2 gap-2">
                    {SEASON_MONTHS.map((m) => {
                      const v = dailyFor(b, m);
                      return (
                        <li key={m} className={`rounded-xl px-3 py-2 ring-1 ${pct && v != null ? "bg-[#fff1ee] ring-[#e8453c]/15" : "bg-mist ring-navy/5"}`}>
                          <span className="block text-[11px] leading-tight text-navy/50">{monthName(m, lang)}</span>
                          {v == null ? (
                            <span className="block text-sm font-semibold text-navy/40">–</span>
                          ) : pct ? (
                            <span className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold tabular-nums text-[#c0332b]">{money(off(v, pct), b.currency, lang)}</span>
                              <span className="text-[11px] tabular-nums text-navy/40 line-through">{money(v, b.currency, lang)}</span>
                            </span>
                          ) : (
                            <span className="block text-sm font-semibold tabular-nums text-navy">{money(v, b.currency, lang)}</span>
                          )}
                          {weeklyFor(b, m) != null && <span className="mt-0.5 block text-[11px] leading-tight text-navy/55">{lang === "en" ? "Week" : "Haftalık"}: <b className={`tabular-nums ${pct ? "text-[#c0332b]" : "text-navy"}`}>{money(off(weeklyFor(b, m)!, pct), b.currency, lang)}</b></span>}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 text-xs text-navy/50">{lang === "en" ? SEASON_MONTHS.some((m) => weeklyFor(b, m) != null) ? "Daily prices; weekly rates apply for 7 nights or more. Pick your dates below for the total." : "Prices are per day. Pick your dates below to see the total." : SEASON_MONTHS.some((m) => weeklyFor(b, m) != null) ? "Günlük fiyatlar; 7 gece ve üzerinde haftalık fiyat uygulanır. Toplam için aşağıdan tarih seçin." : "Fiyatlar günlüktür. Toplam tutar için aşağıdan tarih seçin."}</p>
                </div>
              );
            })()}
            {b.brochure && (
              <a href={b.brochure} target="_blank" rel="noopener" download className="mt-5 flex items-center gap-3 rounded-2xl bg-navy px-4 py-3.5 text-white transition hover:bg-navy-soft">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-turquoise"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 3h7l5 5v13H7zM14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5" /></svg></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{lang === "en" ? "Download yacht brochure" : "Tanıtım dosyasını indir"}</span><span className="block text-xs text-white/60">PDF</span></span>
                <span aria-hidden>↓</span>
              </a>
            )}
            <div className="mt-6 border-t border-navy/10 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-navy">{L.requestTitle}</h2>
              <RequestPanel boatSlug={b.slug} boatName={b.name} maxGuests={Math.max(b.guests, 1)} whatsapp={contact.whatsapp} lang={lang} pricing={{ showPrice: b.showPrice, priceDaily: b.priceDaily, monthly: b.monthly, weekly: b.weekly, currency: b.currency, percent: b.offer?.percent ?? 0, vatMode: b.vatMode, vatRate: b.vatRate }} />
            </div>
          </aside>
        </div>

        <ReviewSection id="yorumlar" reviews={reviews} lang={lang} />

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
