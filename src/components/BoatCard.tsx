import Link from "next/link";
import { type Boat, priceLabel } from "@/lib/data";
import { Placeholder } from "./Placeholder";

export function BoatCard({ b }: { b: Boat }) {
  const price = priceLabel(b);
  return (
    <Link href={`/tekneler/${b.slug}`} className="group block overflow-hidden rounded-2xl border border-navy/10 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <Placeholder hue={b.hue} className="aspect-[4/3]" />
      <article className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{b.type} · {b.port}</p>
        <h3 className="mt-1 text-lg font-semibold text-navy">{b.name}</h3>
        <p className="mt-2 text-sm text-navy/60">
          {b.guests} misafir · {b.cabins > 0 ? `${b.cabins} kabin · ` : ""}{b.length} m
        </p>
        <p className={`mt-4 text-sm font-semibold ${price ? "text-navy" : "text-turquoise-dark"}`}>{price ?? "Fiyat sorunuz"}</p>
      </article>
    </Link>
  );
}
