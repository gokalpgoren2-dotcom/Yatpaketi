import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { PostCard } from "@/components/PostCard";
import { BoatIcon } from "@/components/BoatIcon";
import { getNavInfo, getPosts } from "@/lib/posts";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Yatpaketi Rehberi",
  description: "Destinasyonlar, klasik rotalar, tur paketleri ve kiralama süreci: mavi yolculuğu planlamak için bilmeniz gereken her şey.",
  alternates: { canonical: "/rehber" },
};

export default async function GuidePage() {
  const [nav, posts] = await Promise.all([getNavInfo(), getPosts("guide")]);
  const sections = [
    { show: nav.hasDestinations, href: "/destinasyonlar", icon: "pin", title: "Destinasyonlar", text: "Koylar, adalar, antik limanlar: nerede ne var, ne zaman gidilir." },
    { show: nav.hasRoutes, href: "/rotalar", icon: "route", title: "Klasik Rotalar", text: "Denenmiş mavi yolculuk rotaları ve gün gün tanıtımları." },
    { show: nav.hasPackages, href: "/tur-paketleri", icon: "package", title: "Tur Paketleri", text: "Süresi ve amacı belli, kolay seçilen tekne paketleri." },
    { show: nav.hasProcess, href: "/kiralama-sureci", icon: "process", title: "Kiralama Süreci", text: "Talepten teslime: kumanya, karşılama ve seyir günleri." },
    { show: nav.pages.some((p) => p.slug === "hakkimizda"), href: "/hakkimizda", icon: "about", title: "Hakkımızda", text: "Yatpaketi kimdir, nasıl çalışır?" },
  ].filter((s) => s.show);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">Yatpaketi Rehberi</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">Mavi yolculuğu planlamak için rehberiniz</h1>
        <p className="mt-4 max-w-2xl text-navy/70">Nereye gidilir, hangi rota seçilir, rezervasyondan sonra neler olur? Hepsi burada.</p>

        {sections.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className="group flex gap-4 rounded-3xl bg-white p-6 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-turquoise/10 text-turquoise-dark"><BoatIcon name={s.icon} /></span>
                <span>
                  <span className="block font-semibold text-navy">{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-navy/65">{s.text}</span>
                  <span className="mt-2 block text-sm font-semibold text-turquoise-dark">Göz at →</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <section id="yazilar" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl text-navy lg:text-3xl">Rehber yazıları</h2>
            <p className="mt-2 max-w-2xl text-navy/70">Tekne seçimi, yemek, mürettebat ve daha fazlası: ilk kez tekne kiralayanlar için kısa rehberler.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p, i) => <PostCard key={p.slug} p={p} i={i} />)}</div>
          </section>
        )}

        {sections.length === 0 && posts.length === 0 && (
          <p className="mt-10 rounded-3xl bg-mist p-8 text-center text-navy/70">Rehber çok yakında burada olacak.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
