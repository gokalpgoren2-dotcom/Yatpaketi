import Link from "next/link";
import { Logo } from "./Logo";
import { BoatCard } from "./BoatCard";
import { Placeholder } from "./Placeholder";
import { boats, categories, destinations, posts, routes } from "@/lib/data";

function Heading({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <div id={id} className="mb-10 max-w-2xl scroll-mt-24">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{eyebrow}</p>
      <h2 className="font-display text-3xl font-medium text-navy lg:text-4xl">{title}</h2>
    </div>
  );
}

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export function Destinations() {
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <Heading id="destinasyonlar" eyebrow="Destinasyonlar" title="Popüler Rotalar ve Koylar" />
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destinasyonlar/${d.slug}`} className="group relative min-w-[70%] snap-start overflow-hidden rounded-2xl sm:min-w-[40%] lg:min-w-0">
              <Placeholder hue={d.hue} className="aspect-[3/4] transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="font-display text-2xl">{d.name}</h3>
                <p className="text-sm text-white/80">{d.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedBoats() {
  return (
    <section className="bg-mist py-16 lg:py-24">
      <div className={wrap}>
        <Heading id="tekneler" eyebrow="Öne Çıkan Tekneler" title="Sizin İçin Seçtiklerimiz" />
        <p className="-mt-6 mb-8 text-sm text-navy/50">Örnek içerik: Gerçek tekneler admin panelinden eklenecek.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boats.slice(0, 6).map((b) => <BoatCard key={b.slug} b={b} />)}
        </div>
        <div className="mt-10 text-center">
          <Link href="/tekneler" className="inline-block rounded-full bg-turquoise px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-turquoise-dark">Tüm Tekneleri Gör</Link>
        </div>
      </div>
    </section>
  );
}

export function Categories() {
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <Heading eyebrow="Kategoriler" title="Size Uygun Tekne Tipini Seçin" />
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link key={c} href={`/tekneler?tip=${encodeURIComponent(c)}`} className="rounded-full border border-navy/15 px-6 py-3 text-sm font-medium text-navy transition hover:border-turquoise hover:bg-turquoise hover:text-white">
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RentalModes() {
  const modes = [
    { title: "Günlük Kiralama", text: "Bir günlük koy turları, doğum günü ve özel organizasyonlar için.", hue: 178 },
    { title: "Haftalık Kiralama", text: "Kabinli mavi yolculuk: kaptan ve mürettebat dahil seçenekler.", hue: 200 },
    { title: "Lüks Yat Koleksiyonu", text: "Üst segment yatlar, kişiye özel rota ve hizmet.", hue: 220 },
  ];
  return (
    <section className="bg-navy py-16 text-white lg:py-24">
      <div className={wrap}>
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">Kiralama Seçenekleri</p>
          <h2 className="font-display text-3xl font-medium lg:text-4xl">İhtiyacınıza Göre Planlayın</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {modes.map((m) => (
            <div key={m.title} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Placeholder hue={m.hue} className="aspect-[16/9]" />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Routes() {
  return (
    <section className="py-16 lg:py-24">
      <div className={wrap}>
        <Heading id="mavi-yolculuk" eyebrow="Mavi Yolculuk" title="Klasik Rotalar" />
        <div className="grid gap-6 md:grid-cols-3">
          {routes.map((r) => (
            <div key={r.name} className="rounded-2xl border border-navy/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{r.days}</p>
              <h3 className="font-display mt-2 text-2xl text-navy">{r.name}</h3>
              <p className="mt-3 text-sm text-navy/60">{r.stops}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    ["Seçilmiş filo", "Tekneleri tek tek inceleyip listeliyoruz."],
    ["Şeffaf süreç", "Rezervasyon talebiniz kesin rezervasyon değildir; onay sonrası netleşir."],
    ["Yerel uzmanlık", "Rota ve koy önerilerinde bölgeyi bilen ekip."],
    ["Yakın destek", "Telefon ve WhatsApp ile hızlı iletişim."],
  ];
  return (
    <section className="bg-mist py-16 lg:py-24" id="hakkimizda">
      <div className={wrap}>
        <Heading eyebrow="Neden yatpaketi?" title="Güvenle Seçin, Rahatça Yolculuk Yapın" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-turquoise" />
              <h3 className="font-semibold text-navy">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/60">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Blog() {
  return (
    <section className="py-16 lg:py-24" id="blog">
      <div className={wrap}>
        <Heading eyebrow="Blog" title="Seyahat Rehberi" />
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <article key={p.title} className="overflow-hidden rounded-2xl border border-navy/10">
              <Placeholder hue={185 + i * 12} className="aspect-[16/10]" />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-turquoise">{p.tag}</p>
                <h3 className="mt-2 font-semibold text-navy">{p.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Support() {
  return (
    <section className="bg-turquoise py-14 text-white" id="iletisim">
      <div className={`${wrap} flex flex-col items-start justify-between gap-6 md:flex-row md:items-center`}>
        <div>
          <h2 className="font-display text-3xl font-medium">Rotanızı birlikte planlayalım.</h2>
          <p className="mt-2 text-white/90">Tarih ve kişi sayınızı iletin, size uygun tekneleri önerelim.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Rezervasyon formu Aşama 2'de, telefon ve WhatsApp admin Ayarlar bölümünden gelecek. */}
          <Link href="/tekneler" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy">Tekneleri İncele</Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy py-12 text-sm text-white/70">
      <div className={`${wrap} flex flex-col justify-between gap-6 md:flex-row`}>
        <div>
          <div className="inline-block rounded-xl bg-white px-4 py-2"><Logo height={32} /></div>
          <p className="mt-2 max-w-xs">Türkiye’de yat ve tekne kiralama platformu.</p>
        </div>
        <p>© {new Date().getFullYear()} yatpaketi. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
