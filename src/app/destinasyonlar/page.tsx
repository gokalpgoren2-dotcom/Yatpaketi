import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Placeholder } from "@/components/Placeholder";
import { boatsFor, destinations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Destinasyonlar",
  description: "Göcek, Bodrum, Fethiye, Marmaris ve Antalya çıkışlı tekne kiralama rotaları.",
  alternates: { canonical: "/destinasyonlar" },
};

export default function DestinationsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">Destinasyonlar</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">Rotanızı Seçin</h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destinasyonlar/${d.slug}`} className="group overflow-hidden rounded-2xl border border-navy/10 transition hover:-translate-y-1 hover:shadow-xl">
              <Placeholder hue={d.hue} className="aspect-[16/10]" />
              <div className="p-5">
                <h2 className="font-display text-2xl text-navy">{d.name}</h2>
                <p className="mt-1 text-sm text-navy/60">{d.blurb}</p>
                <p className="mt-3 text-sm font-medium text-turquoise-dark">{boatsFor(d.slug).length} tekne</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
