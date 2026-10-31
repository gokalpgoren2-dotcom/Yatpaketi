import Link from "next/link";
import { Photo } from "./Photo";
import { Placeholder } from "./Placeholder";
import type { Post, PostKind } from "@/lib/posts";

const base: Record<PostKind, string> = { guide: "/rehber", blog: "/blog", page: "" };
export const postHref = (p: Pick<Post, "kind" | "slug">) => `${base[p.kind]}/${p.slug}`;

export function PostCard({ p, i = 0 }: { p: Post; i?: number }) {
  return (
    <Link href={postHref(p)} className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15">
      <div className="relative aspect-[16/10] overflow-hidden">
        {p.cover ? (
          <Photo src={p.cover} alt={p.title} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder hue={185 + (i % 5) * 12} className="h-full w-full transition duration-500 group-hover:scale-105" label={false} />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-navy">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy/65">{p.excerpt}</p>}
        <p className="mt-3 text-sm font-semibold text-turquoise-dark">Oku →</p>
      </div>
    </Link>
  );
}

