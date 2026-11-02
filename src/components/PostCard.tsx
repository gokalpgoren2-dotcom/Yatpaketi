import { GuideArt, hasGuideArt } from "./GuideArt";
import Link from "next/link";
import { Photo } from "./Photo";
import { Placeholder } from "./Placeholder";
import type { Post, PostKind } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { regionMapFor } from "@/lib/region-maps";

const base: Record<PostKind, string> = { guide: "/rehber", blog: "/blog", page: "", destination: "/destinasyonlar", route: "/rotalar", package: "/tur-paketleri", process: "/kiralama-sureci" };
export const postHref = (p: Pick<Post, "kind" | "slug">, lang: Lang = "tr") => href(lang, p.kind === "process" ? base.process : `${base[p.kind]}/${p.slug}`);

const KIND: Record<PostKind, [string, string]> = {
  guide: ["Rehber", "Guide"], blog: ["Blog", "Blog"], page: ["Sayfa", "Page"], destination: ["Destinasyon", "Destination"],
  route: ["Klasik rota", "Classic route"], package: ["Tur paketi", "Tour package"], process: ["Kiralama süreci", "Charter process"],
};
export const kindLabel = (k: PostKind, lang: Lang) => KIND[k][lang === "en" ? 1 : 0];

// Yazının görseli: bölge haritası > kapak fotoğrafı > hazır çizim > renkli yer tutucu. Üst öğe "relative" olmalı.
export function PostThumb({ p, i = 0, sizes }: { p: Post; i?: number; sizes: string }) {
  const map = regionMapFor(p.kind, p.slug);
  const cls = "transition duration-700 group-hover:scale-105";
  if (map) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={map} alt={p.title} loading="lazy" className={`absolute inset-0 h-full w-full bg-[#05204a] object-cover ${cls}`} />;
  }
  if (p.cover) return <Photo src={p.cover} alt={p.title} sizes={sizes} className={`object-cover ${cls}`} />;
  if (hasGuideArt(p.kind, p.slug)) return <GuideArt slug={p.slug} className={`absolute inset-0 h-full w-full ${cls}`} />;
  return <div className="absolute inset-0"><Placeholder hue={185 + (i % 5) * 12} className={`h-full w-full ${cls}`} label={false} /></div>;
}

export function PostCard({ p, i = 0, lang = "tr" }: { p: Post; i?: number; lang?: Lang }) {
  const map = regionMapFor(p.kind, p.slug);
  return (
    <Link href={postHref(p, lang)} className="group flex h-full flex-col rounded-[1.75rem] bg-white p-2.5 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 hover:ring-turquoise/40">
      <div className={`relative overflow-hidden rounded-[1.35rem] bg-mist ${map ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        <PostThumb p={p} i={i} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-turquoise-dark">{kindLabel(p.kind, lang)}</p>
        <h3 className="font-display mt-1.5 text-xl font-semibold leading-snug text-navy">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/60">{p.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-sm font-semibold text-navy/70 transition group-hover:text-turquoise-dark">{lang === "en" ? "Read" : "Oku"}</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-navy transition group-hover:bg-turquoise group-hover:text-white" aria-hidden>→</span>
        </div>
      </div>
    </Link>
  );
}
