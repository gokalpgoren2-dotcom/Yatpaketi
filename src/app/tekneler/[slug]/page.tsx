import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { boats, destinations, getBoat, priceLabel } from "@/lib/data";

export function generateStaticParams() {
  return boats.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBoat(slug);
  if (!b) return {};
  return {
    title: `${b.name} | ${b.type} Kiralama ${b.port}`,
    description: `${b.name}: ${b.guests} misafir, ${b.cabins} kabin, ${b.length} m. ${b.port} çıkışlı ${b.type.toLowerCase()} kiralama.`,
    alternates: { canonical: `/tekneler/${b.slug}` },
    robots: { index: false, follow: true }, // örnek veri: gerçek tekne girilince açılacak
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
  const b = getBoat(slug);
  if (!b) notFound();
  const price = priceLabel(b);
  const regions = destinations.filter((d) => b.destinations.includes(d.slug));
  const similar = boats.filter((x) => x.slug !== b.slug && (x.type === b.type || x.destinations.some((d) => b.destinations.includes(d)))).slice(0, 3);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <nav className="mb-4 text-sm text-navy/60" aria-label="Sayfa yolu">
          <Link href="/tekneler" className="hover:text-turquoise">Kiralık Tekneler</Link> / {b.name}
        </nav>
        <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{b.type} · {b.port}</p>
        <h1 className="font-display mt-1 text-3xl font-medium text-navy lg:text-5xl">{b.name}</h1>
        <p className="mt-2 text-sm text-navy/50">Örnek içerik: Fotoğraflar ve bilgiler admin panelinden girilecek.</p>

        <div className="mt-8 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <Placeholder hue={b.hue} className="aspect-[16/10] rounded-2xl" />
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {[12, 24, 36].map((o) => <Placeholder key={o} hue={b.hue + o} className="aspect-[4/3] rounded-2xl lg:aspect-auto lg:h-full" label={false} />)}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="font-display text-2xl text-navy">Tekne hakkında</h2>
            <p className="mt-3 leading-relaxed text-navy/70">{b.description}</p>

            <h2 className="font-display mt-10 text-2xl text-navy">Teknik özellikler</h2>
            <dl className="mt-3 grid gap-x-10 sm:grid-cols-2">
              <Spec k="Tekne tipi" v={b.type} />
              <Spec k="Marka / model" v={`${b.brand} ${b.model}`} />
              <Spec k="Yapım yılı" v={String(b.year)} />
              <Spec k="Yenileme yılı" v={b.refit ? String(b.refit) : "Belirtilmedi"} />
              <Spec k="Uzunluk" v={`${b.length} m`} />
              <Spec k="Genişlik" v={`${b.width} m`} />
              <Spec k="Kabin" v={String(b.cabins)} />
              <Spec k="Misafir kapasitesi" v={String(b.guests)} />
              <Spec k="Mürettebat" v={b.crew > 0 ? `${b.crew} kişi` : "Mürettebatsız"} />
              <Spec k="Kaptan" v={b.captained ? "Dahil" : "Dahil değil"} />
              <Spec k="Kalkış limanı" v={b.port} />
              <Spec k="Kiralama bölgeleri" v={regions.map((r) => r.name).join(", ")} />
            </dl>

            <h2 className="font-display mt-10 text-2xl text-navy">Donanımlar</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {b.equipment.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{e}</li>)}
            </ul>
            <h2 className="font-display mt-10 text-2xl text-navy">Su sporları ekipmanları</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {b.waterSports.map((e) => <li key={e} className="rounded-full bg-mist px-4 py-2 text-sm text-navy">{e}</li>)}
            </ul>

            <h2 className="font-display mt-10 text-2xl text-navy">Müsaitlik</h2>
            <p className="mt-3 rounded-2xl bg-mist p-5 text-sm text-navy/70">Müsaitlik takvimi sonraki aşamada eklenecek. Şimdilik tarihler için bizimle iletişime geçmeniz gerekir.</p>
          </div>

          <aside className="h-fit rounded-2xl border border-navy/10 p-6 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Fiyat</p>
            <p className={`mt-1 text-2xl font-semibold ${price ? "text-navy" : "text-turquoise-dark"}`}>{price ?? "Fiyat sorunuz"}</p>
            {b.showPrice && b.priceDaily && b.priceWeekly && (
              <p className="mt-1 text-sm text-navy/60">Günlük: {b.priceDaily.toLocaleString("tr-TR")} {b.currency}</p>
            )}
            <div className="mt-5 rounded-xl bg-mist p-4 text-sm text-navy/70">
              Rezervasyon talep formu ve WhatsApp bağlantısı, iletişim bilgileri sisteme girildiğinde eklenecek. Talebiniz kesin rezervasyon oluşturmayacaktır.
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
