import Link from "next/link";
import { Photo } from "./Photo";
import { endsAt, type Campaign } from "@/lib/campaigns";
import { publicImageUrl } from "@/lib/supabase/config";
import { href, type Lang } from "@/lib/i18n";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

function untilText(c: Campaign, lang: Lang) {
  const e = endsAt(c);
  if (!e) return "";
  const days = Math.ceil((e.getTime() - Date.now()) / 86400000);
  const date = e.toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
  if (days <= 14) return lang === "en" ? `${days <= 1 ? "Last day" : `${days} days left`} · until ${date}` : `${days <= 1 ? "Son gün" : `${days} gün kaldı`} · ${date}`;
  return lang === "en" ? `Valid until ${date}` : `${date} tarihine kadar`;
}

function Cta({ link, lang, children, className }: { link: string; lang: Lang; children: React.ReactNode; className: string }) {
  if (/^https?:\/\//.test(link)) return <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  return <Link href={link.startsWith("/") ? href(lang, link) : link} className={className}>{children}</Link>;
}

export function Campaigns({ items, lang = "tr" }: { items: Campaign[]; lang?: Lang }) {
  if (items.length === 0) return null;
  const en = lang === "en";
  const pick = (tr: string, e: string) => (en ? e.trim() || tr : tr.trim() || e);
  return (
    <section className="pt-12 lg:pt-16" aria-label={en ? "Offers" : "Kampanyalar"}>
      <div className={wrap}>
        <div className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0 ${items.length === 1 ? "lg:grid-cols-1" : items.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          {items.map((c) => {
            const img = publicImageUrl(c.image);
            const when = untilText(c, lang);
            const badge = pick(c.badge, c.badgeEn);
            const text = pick(c.text, c.textEn);
            const cta = pick(c.cta, c.ctaEn) || (en ? "See offer" : "Fırsatı gör");
            return (
              <article key={c.id} className={`relative flex min-h-[18rem] w-[86%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-[#0b4a66] p-6 text-white sm:w-[60%] lg:w-auto lg:p-8 ${items.length === 1 ? "lg:min-h-[16rem]" : ""}`}>
                {img && (
                  <>
                    <Photo src={img} alt="" sizes="(min-width:1024px) 40vw, 86vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/55 to-navy/30" />
                  </>
                )}
                <div className="relative flex items-start justify-between gap-3">
                  {badge ? <span className="rounded-full bg-turquoise px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-navy">{badge}</span> : <span />}
                  {c.discount.trim() && <span className="font-display text-4xl font-bold leading-none text-turquoise lg:text-5xl">{c.discount}</span>}
                </div>
                <div className="relative mt-8">
                  <h3 className="font-display text-2xl font-bold leading-tight lg:text-3xl">{pick(c.title, c.titleEn)}</h3>
                  {text && <p className="mt-2 max-w-md text-white/80">{text}</p>}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <Cta link={c.link || "/tekneler"} lang={lang} className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-turquoise">{cta} →</Cta>
                    {when && <span className="text-xs font-medium text-white/75">{when}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
