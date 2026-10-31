import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { priceLabel } from "@/lib/data";
import { getBoatBySlug, getContact, getDestinations } from "@/lib/content";
import { RequestPanel } from "@/components/RequestPanel";

export const revalidate = 60;
export const maxDuration = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { boat: b } = await getBoatBySlug(slug);
  if (!b) return {};
  return {
    title: [b.name, b.type && `${b.type} Kiralama`, b.port].filter(Boolean).join(" | "),
    description: `${b.name}: ${b.guests} misafir${b.cabins ? `, ${b.cabins} kabin` : ""}${b.length ? `, ${b.length} m` : ""}.${b.port ? ` ${b.port} çıkışlı` : ""} ${b.type ? b.type.toLowerCase() + " kiralama." : "tekne kiralama."}`,
    alternates: { canonical: `/tekneler/${b.slug}` },
    robots: { index: false, follow: true }, // rezervasyon talep formu hazır olana kadar kapalı
  };
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy/10 py-3 text-sm">
      <dt className="text-navy/60">{k}</dt>
      <dd className="text-right font-medium text-navy">{v}</dd>
    </div>
  );
}

export default async function BoatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ boat: b, all: boats, sample }, destinations, contact] = await Promise.all([getBoatBySlug(slug), getDestinations(), getContact()]);
  if (!b) notFound();
  const price = priceLabel(b);
  const regions = destinations.filter((d) => b.destinations.includes(d.slug));
  const gallery = b.images ?? [];
  const similar = boats.filter((x) => x.slug !== b.slug && (x.type === b.type || x.destinations.some((d) => b.destinations.includes(d)))).slice(0, 3);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <nav className="mb-4 text-sm text-navy/60" aria-label="Sayfa yolu">
          <Link href="/tekneler" className="hover:text-turquoise">Kiralık Tekneler</Link> / {b.name}
        </nav>
        <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{[b.type, b.port].filter(Boolean).join(" · ")}</p>
        <h1 className="font-display mt-1 text-3xl font-medium text-navy lg:text-5xl">{b.name}</h1>
        {sample && <p className="mt-2 text-sm text-navy/50">Örnek içerik: Veritabanı bağlı olmadığı için örnek tekne gösteriliyor.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3 lg:hidden">
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${price ? "bg-navy text-white" : "bg-mist text-turquoise-dark"}`}>{price ?? "Fiyat sorunuz"}</span>
          <a href="#talep" className="rounded-full bg-turquoise px-5 py-2 text-sm font-semibold text-white">Talep gönder</a>
        </div>

        {gallery.length > 0 ? (
          <div className="mt-8 space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-mist lg:aspect-[16/8]">
              <Photo src={gallery[0]} alt={b.name} priority sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" />
            </div>
            {gallery.length > 1 && (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {gallery.slice(1).map((src, i) => (
                  <li key={src}>
                    <a href={src} target="_blank" rel="noopener" className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-mist">
                      <Photo src={src} alt={`${b.name} fotoğraf ${i + 2}`} sizes="(min-width:1024px) 16vw, 33vw" className="object-cover transition hover:scale-105" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
            <Placeholder hue={b.hue} className="aspect-[16/10] rounded-2xl" />
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[12, 24, 36].map((o) => <Placeholder key={o} hue={b.hue + o} className="aspect-[4/3] rounded-2xl lg:aspect-auto lg:h-full" label={false} />)}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            {b.description && (
              <>
                <h2 className="font-display text-2xl text-navy">Tekne hakkında</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-navy/70">{b.description}</p>
              </>
            )}

            <h2 className="font-display mt-10 text-2xl text-navy">Teknik özellikler</h2>
            <dl className="mt-3 grid gap-x-10 sm:grid-cols-2">
              <Spec k="Tekne tipi" v={b.type || "Belirtilmedi"} />
              <Spec k="Marka / model" v={`${b.brand} ${b.model}`.trim() || "Belirtilmedi"} />
              <Spec k="Yapım yılı" v={b.year ? String(b.year) : "Belirtilmedi"} />
              <Spec k="Yenileme yılı" v={b.refit ? String(b.refit) : "Belirtilmedi"} />
              <Spec k="Uzunluk" v={b.length > 0 ? `${b.length} m` : "Belirtilmedi"} />
              <Spec k="Genişlik" v={b.width > 0 ? `${b.width} m` : "Belirtilmedi"} />
              <Spec k="Kabin" v={String(b.cabins)} />
              <Spec k="Misafir kapasitesi" v={String(b.guests)} />
              <Spec k="Mürettebat" v={b.crew > 0 ? `${b.crew} kişi` : "Mürettebatsız"} />
              <Spec k="Kaptan" v={b.captained ? "Dahil" : "Dahil değil"} />
              <Spec k="Kalkış limanı" v={b.port || "Belirtilmedi"} />
              <Spec k="Kiralama bölgeleri" v={regions.map((r) => r.name).join(", ") || "Belirtilmedi"} />
            </dl>

            {b.equipment.length > 0 && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">Donanımlar</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {b.equipment.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{e}</li>)}
                </ul>
              </>
            )}
            {b.waterSports.length > 0 && (
              <>
                <h2 className="font-display mt-10 text-2xl text-navy">Su sporları ekipmanları</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {b.waterSports.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{e}</li>)}
                </ul>
              </>
            )}

            <h2 className="font-display mt-10 text-2xl text-navy">Müsaitlik</h2>
            <p className="mt-3 rounded-2xl bg-mist p-5 text-sm text-navy/70">Müsaitlik ve kesin fiyat, rezervasyon talebiniz sonrasında teyit edilir. Tarihlerinizi talep kartından iletebilirsiniz.</p>
          </div>

          <aside id="talep" className="h-fit scroll-mt-24 rounded-3xl border border-navy/10 bg-white p-6 shadow-xl shadow-navy/5 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Fiyat</p>
            <p className={`mt-1 text-2xl font-semibold ${price ? "text-navy" : "text-turquoise-dark"}`}>{price ?? "Fiyat sorunuz"}</p>
            {b.showPrice && b.priceDaily && b.priceWeekly && (
              <p className="mt-1 text-sm text-navy/60">Günlük: {b.priceDaily.toLocaleString("tr-TR")} {b.currency}</p>
            )}
            <div className="mt-6 border-t border-navy/10 pt-6">
              <h2 className="mb-4 text-lg font-semibold text-navy">Rezervasyon talebi gönderin</h2>
              <RequestPanel boatSlug={b.slug} boatName={b.name} maxGuests={Math.max(b.guests, 1)} whatsapp={contact.whatsapp} />
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-navy">Benzer tekneler</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => <BoatCard key={s.slug} b={s} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
