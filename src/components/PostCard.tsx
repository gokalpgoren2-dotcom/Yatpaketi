import Link from "next/link";
import { Photo } from "./Photo";
import { Placeholder } from "./Placeholder";
import type { Post, PostKind } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { regionMapFor } from "@/lib/region-maps";

const base: Record<PostKind, string> = { guide: "/rehber", blog: "/blog", page: "", destination: "/destinasyonlar", route: "/rotalar", package: "/tur-paketleri", process: "/kiralama-sureci" };
export const postHref = (p: Pick<Post, "kind" | "slug">, lang: Lang = "tr") => href(lang, p.kind === "process" ? base.process : `${base[p.kind]}/${p.slug}`);

export function PostCard({ p, i = 0, lang = "tr" }: { p: Post; i?: number; lang?: Lang }) {
  const map = regionMapFor(p.kind, p.slug); // bölge haritası varsa kapak odur
  return (
    <Link href={postHref(p, lang)} className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15">
      <div className={`relative overflow-hidden ${map ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        {map ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={map} alt={p.title} loading="lazy" className="h-full w-full bg-[#05204a] object-cover transition duration-500 group-hover:scale-105" />
        ) : p.cover ? (
          <Photo src={p.cover} alt={p.title} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder hue={185 + (i % 5) * 12} className="h-full w-full transition duration-500 group-hover:scale-105" label={false} />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-navy">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy/65">{p.excerpt}</p>}
        <p className="mt-3 text-sm font-semibold text-turquoise-dark">{lang === "en" ? "Read →" : "Oku →"}</p>
      </div>
    </Link>
  );
}

