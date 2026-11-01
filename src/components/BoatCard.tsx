import { Photo } from "./Photo";
import Link from "next/link";
import { type Boat, priceLabel } from "@/lib/data";
import { Placeholder } from "./Placeholder";
import { href, t, type Lang } from "@/lib/i18n";

export function BoatCard({ b, lang = "tr" }: { b: Boat; lang?: Lang }) {
  const L = t(lang);
  const price = priceLabel(b, lang);
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
        {b.captained && <span className="absolute right-3 top-3 rounded-full bg-turquoise px-3 py-1 text-xs font-semibold text-white">{L.captained}</span>}
        <p className="absolute bottom-3 left-3 rounded-full bg-navy/80 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">{price ?? L.askPrice}</p>
      </div>
      <article className="p-5">
        <h3 className="text-lg font-semibold text-navy">{b.name}</h3>
        {b.port && <p className="mt-0.5 text-sm text-navy/55">{b.port}</p>}
        <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy/75">
          <li className="rounded-full bg-mist px-3 py-1.5">{L.guestsN(b.guests)}</li>
          {b.cabins > 0 && <li className="rounded-full bg-mist px-3 py-1.5">{L.cabinsN(b.cabins)}</li>}
          {b.length > 0 && <li className="rounded-full bg-mist px-3 py-1.5">{b.length} m</li>}
        </ul>
      </article>
    </Link>
  );
}
