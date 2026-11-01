import { Photo } from "./Photo";
import Link from "next/link";
import { type Boat, priceLabel } from "@/lib/data";
import { Placeholder } from "./Placeholder";
import { href, t, type Lang } from "@/lib/i18n";
import { offerLabel } from "@/lib/campaigns";
import { RatingLine } from "./Reviews";

const svg = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const IconGuests = () => <svg {...svg}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M17 14.2c2.3.2 4 2 4 4.8" /></svg>;
const IconCabins = () => <svg {...svg}><path d="M3 18V8" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /><path d="M21 18v2M3 18v2" /></svg>;
const IconLength = () => <svg {...svg}><path d="M3 9v6h18V9z" /><path d="M7 9v3M11 9v2M15 9v3M19 9v2" /></svg>;
const IconCrew = () => <svg {...svg}><circle cx="12" cy="7" r="3" /><path d="M12 10v11M5 14c0 3.9 3 7 7 7s7-3.1 7-7M8 13H5m14 0h-3" /></svg>;
const IconYear = () => <svg {...svg}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>;
const IconRefit = () => <svg {...svg}><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z" /></svg>;
const IconAc = () => <svg {...svg}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="M9.5 4.5 12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2" /></svg>;
const IconJacuzzi = () => <svg {...svg}><path d="M3 13h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" /><path d="M8 9c0-1.5 1.5-1.5 1.5-3M12 9c0-1.5 1.500-1.500 1.500-3M16 9c0-1.5 1.5-1.5 1.5-3" /></svg>;
const chip = "inline-flex items-center gap-1.5 rounded-full bg-turquoise/10 px-3 py-1.5 text-turquoise-dark";

export function BoatCard({ b, lang = "tr" }: { b: Boat; lang?: Lang }) {
  const L = t(lang);
  const price = priceLabel(b, lang);
  const en = lang === "en";
  const has = (re: RegExp) => b.equipment.some((e) => re.test(e));
  return (
    <Link
      href={href(lang, `/tekneler/${b.slug}`)}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {b.image ? (
          <Photo src={b.image} alt={b.name} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 85vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder hue={b.hue} className="h-full w-full transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
        {b.type && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy">{b.type}</span>}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {b.captained && <span className="inline-flex items-center gap-1.5 rounded-full bg-turquoise px-3 py-1 text-xs font-semibold text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="7" r="3" /><path d="M12 10v11M5 14c0 3.9 3 7 7 7s7-3.100 7-7M8 13H5m14 0h-3" /></svg>{L.captained}</span>}
          {b.offer && <span className="inline-flex items-center rounded-full bg-[#e8453c] px-3 py-1 text-xs font-bold text-white shadow">{offerLabel(b.offer, lang)}</span>}
        </div>
        <p className="absolute bottom-3 left-3 rounded-full bg-navy/80 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">{price ?? L.askPrice}</p>
      </div>
      <article className="p-5">
        <h3 className="text-lg font-bold text-navy">{b.name}</h3>
        {b.port && <p className="mt-0.5 text-sm text-navy/55">{b.port}</p>}
        {b.rating && <RatingLine rating={b.rating} lang={lang} className="mt-1.5" />}
        <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy/75">
          <li className={chip}><IconGuests /><span className="text-navy/80">{L.guestsN(b.guests)}</span></li>
          {b.cabins > 0 && <li className={chip}><IconCabins /><span className="text-navy/80">{L.cabinsN(b.cabins)}</span></li>}
          {b.length > 0 && <li className={chip}><IconLength /><span className="text-navy/80">{b.length} m</span></li>}
          {b.crew > 0 && <li className={chip}><IconCrew /><span className="text-navy/80">{b.crew} {en ? "crew" : "personel"}</span></li>}
          {b.year && <li className={chip}><IconYear /><span className="text-navy/80">{b.year}</span></li>}
          {b.refit && <li className={chip}><IconRefit /><span className="text-navy/80">Refit {b.refit}</span></li>}
          {has(/klima|air.?cond/i) && <li className={chip}><IconAc /><span className="text-navy/80">{en ? "A/C" : "Klima"}</span></li>}
          {has(/jakuzi|jacuzzi/i) && <li className={chip}><IconJacuzzi /><span className="text-navy/80">{en ? "Jacuzzi" : "Jakuzi"}</span></li>}
        </ul>
      </article>
    </Link>
  );
}
