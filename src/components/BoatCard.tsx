import { Photo } from "./Photo";
import Link from "next/link";
import { type Boat } from "@/lib/data";
import { Placeholder } from "./Placeholder";
import { href, t, type Lang } from "@/lib/i18n";
import { offerLabel } from "@/lib/campaigns";
import { RatingLine } from "./Reviews";
import { FavButton } from "./FavButton";
import { parseEquipment } from "@/lib/boatOptions";
import { minDaily, money, off } from "@/lib/pricing";

const svg = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
const IconGuests = () => <svg {...svg}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M17 14.2c2.3.2 4 2 4 4.8" /></svg>;
const IconCabins = () => <svg {...svg}><path d="M3 18V8" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /><path d="M21 18v2M3 18v2" /></svg>;
const IconLength = () => <svg {...svg}><path d="M3 9v6h18V9z" /><path d="M7 9v3M11 9v2M15 9v3M19 9v2" /></svg>;
const IconCrew = () => <svg {...svg}><circle cx="12" cy="7" r="3" /><path d="M12 10v11M5 14c0 3.9 3 7 7 7s7-3.1 7-7M8 13H5m14 0h-3" /></svg>;
const IconYear = () => <svg {...svg}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>;
const IconAc = () => <svg {...svg}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /><path d="M9.5 4.5 12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2" /></svg>;

export function BoatCard({ b, lang = "tr" }: { b: Boat; lang?: Lang }) {
  const L = t(lang);
  const from = minDaily(b);
  const pct = b.offer?.percent ?? 0; // geçerli kampanya indirimi
  const en = lang === "en";
  // Klima: yok / var / günde kaç saat dahil
  const acRaw = b.equipment.find((e) => /^klima|air.?cond/i.test(parseEquipment(e).name));
  const acDetail = acRaw ? parseEquipment(acRaw).detail.toLocaleLowerCase("tr") : "";
  const acHours = acDetail.match(/(\d{1,2})\s*saat/)?.[1];
  const ac = !acRaw ? (en ? "No" : "Yok") : /24\s*saat|7\s*\/\s*24|tam gün/.test(acDetail) ? "7/24" : acHours ? (en ? `${acHours} h/day` : `${acHours} sa/gün`) : (en ? "Yes" : "Var");
  const specs: [React.ReactNode, string, string][] = [
    [<IconLength key="l" />, en ? "Length" : "Boy", b.length > 0 ? `${b.length} m` : "–"],
    [<IconCabins key="c" />, en ? "Cabins" : "Kabin", b.cabins > 0 ? String(b.cabins) : "–"],
    [<IconGuests key="g" />, en ? "Guests" : "Misafir", String(b.guests)],
    [<IconCrew key="p" />, en ? "Crew" : "Personel", b.crew > 0 ? String(b.crew) : "–"],
    [<IconYear key="y" />, en ? "Built/Refit" : "Yapım/Refit", b.year ? `${b.year}${b.refit ? ` (${b.refit})` : ""}` : "–"],
    [<IconAc key="a" />, en ? "A/C" : "Klima", ac],
  ];
  return (
    <div className="group relative transition duration-300 hover:-translate-y-1.5">
    <Link
      href={href(lang, `/tekneler/${b.slug}`)}
      className="block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/10 transition duration-300 group-hover:shadow-2xl group-hover:shadow-navy/15"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {b.image ? (
          <Photo src={b.image} alt={b.name} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 85vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder hue={b.hue} className="h-full w-full transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
        {/* Fiyat: fotoğrafın sağ alt köşesi */}
        <div className={`absolute bottom-3 right-3 rounded-2xl px-3.5 py-2 text-right shadow-lg backdrop-blur ${from != null && pct ? "bg-[#e8453c]/95 text-white" : "bg-white/95 text-navy"}`}>
          {from == null ? (
            <p className="text-sm font-semibold text-turquoise-dark">{L.askPrice}</p>
          ) : pct ? (
            <>
              <p className="flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85">
                <span className="rounded-full bg-white px-1.5 py-px text-[10px] font-bold tracking-normal text-[#c0332b]">−%{pct}</span>
                <span className="normal-case tracking-normal line-through opacity-80">{money(from, b.currency, lang)}</span>
              </p>
              <p className="mt-0.5 leading-none"><span className="font-display text-xl font-semibold">{money(off(from, pct), b.currency, lang)}</span> <span className="text-[11px] text-white/85">{en ? "/ day" : "/ gün"}</span></p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50">{en ? "Daily from" : "Günlük, başlayan"}</p>
              <p className="mt-0.5 leading-none"><span className="font-display text-xl font-semibold">{money(from, b.currency, lang)}</span> <span className="text-[11px] text-navy/55">{en ? "/ day" : "/ gün"}</span></p>
            </>
          )}
        </div>
        {b.type && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy">{b.type}</span>}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {b.captained && <span className="inline-flex items-center gap-1.5 rounded-full bg-turquoise px-3 py-1 text-xs font-semibold text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="7" r="3" /><path d="M12 10v11M5 14c0 3.9 3 7 7 7s7-3.100 7-7M8 13H5m14 0h-3" /></svg>{L.captained}</span>}
          {b.offer && <span className="inline-flex items-center rounded-full bg-[#e8453c] px-3 py-1 text-xs font-bold text-white shadow">{offerLabel(b.offer, lang)}</span>}
        </div>
      </div>
      <article className="p-5">
        <h3 className="text-lg font-bold text-navy">{b.name}</h3>
        {b.port && <p className="mt-0.5 text-sm text-navy/55">{b.port}</p>}
        {b.rating && <RatingLine rating={b.rating} lang={lang} className="mt-1.5" />}
        {/* Altı özellik kutusu: boy, kabin, misafir, personel, yapım yılı (refit), klima */}
        <ul className="mt-4 grid grid-cols-3 gap-1.5">
          {specs.map(([icon, label, value]) => (
            <li key={label} className="flex flex-col items-center rounded-xl bg-mist px-1 py-2 text-center ring-1 ring-navy/5">
              <span className="text-turquoise-dark">{icon}</span>
              <span className="mt-1 text-[13px] font-semibold leading-tight text-navy">{value}</span>
              <span className="text-[10px] uppercase tracking-wide text-navy/45">{label}</span>
            </li>
          ))}
        </ul>
      </article>
    </Link>
    <FavButton slug={b.slug} name={b.name} lang={lang} className="absolute left-3 top-12 h-10 w-10 rounded-full bg-white/95 text-navy shadow hover:text-[#e8453c]" />
    </div>
  );
}
