import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { Photo } from "./Photo";
import { PostCard, postHref } from "./PostCard";
import { RichText } from "./RichText";
import { getPost, getPosts, type PostKind } from "@/lib/posts";

export async function ListPage({ kind, eyebrow, title, intro, empty }: { kind: PostKind; eyebrow: string; title: string; intro: string; empty: string }) {
  const posts = await getPosts(kind);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{eyebrow}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-navy/70">{intro}</p>
        {posts.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-mist p-8 text-center text-navy/70">{empty}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p, i) => <PostCard key={p.slug} p={p} i={i} />)}</div>
        )}
      </main>
      <Footer />
    </>
  );
}

export async function postMetadata(kind: PostKind, slug: string): Promise<Metadata> {
  const p = await getPost(kind, slug);
  if (!p) return {};
  const desc = p.seoDescription || p.excerpt || undefined;
  return {
    title: p.seoTitle || p.title,
    description: desc,
    alternates: { canonical: postHref(p) },
    openGraph: { title: p.seoTitle || p.title, description: desc, images: p.cover ? [p.cover] : undefined, type: "article" },
  };
}

export async function ArticlePage({ kind, slug, back }: { kind: PostKind; slug: string; back?: { href: string; label: string } }) {
  const p = await getPost(kind, slug);
  if (!p) notFound();
  const more = kind === "page" ? [] : (await getPosts(kind)).filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-24 lg:pt-32">
        {back && <p className="mb-4 text-sm"><Link href={back.href} className="text-turquoise-dark">← {back.label}</Link></p>}
        <h1 className="font-display text-3xl font-medium leading-tight text-navy lg:text-5xl">{p.title}</h1>
        {p.excerpt && <p className="mt-4 text-lg text-navy/70">{p.excerpt}</p>}
        {p.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-mist">
            <Photo src={p.cover} alt={p.title} priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        <div className="mt-8"><RichText text={p.content} /></div>
        {kind !== "page" && (
          <div className="mt-12 rounded-3xl bg-mist p-6 text-center">
            <p className="font-display text-2xl text-navy">Size uygun tekneyi bulalım.</p>
            <Link href="/tekneler" className="mt-4 inline-block rounded-full bg-turquoise px-7 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">Tekneleri İncele</Link>
          </div>
        )}
        {more.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-navy">{kind === "destination" ? "Diğer destinasyonlar" : kind === "route" ? "Diğer rotalar" : kind === "package" ? "Diğer paketler" : "Diğer yazılar"}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">{more.map((m, i) => <PostCard key={m.slug} p={m} i={i} />)}</div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
