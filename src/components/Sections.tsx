import { Photo } from "./Photo";
import { ContactBubble } from "./ContactBubble";
import Link from "next/link";
import { Logo } from "./Logo";
import { BoatCard } from "./BoatCard";
import { Placeholder } from "./Placeholder";
import { routes, type Boat, type Destination } from "@/lib/data";
import type { Category } from "@/lib/content";
import { getContact } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import { getNavInfo, type Post } from "@/lib/posts";
import { PostCard, postHref } from "./PostCard";

function Heading({ eyebrow, title, id, action }: { eyebrow: string; title: string; id?: string; action?: { href: string; label: string } }) {
  return (
    <div id={id} className="mb-8 flex scroll-mt-24 flex-wrap items-end justify-between gap-4 lg:mb-10">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{eyebrow}</p>
        <h2 className="font-display text-3xl font-medium text-navy lg:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-turquoise hover:text-turquoise-dark">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export function Categories({ items }: { items: Category[] }) {
  return (
    <section className="pb-4 pt-14 lg:pt-20">
      <div className={wrap}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">Tekne tipine göre keşfedin</p>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {items.map((c) => (
            <Link
              key={c.slug}
              href={`/tekne-tipleri/${c.slug}`}
              className="shrink-0 rounded-full bg-mist px-6 py-3 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:bg-turquoise hover:text-white hover:ring-turquoise"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedBoats({ items, sample }: { items: Boat[]; sample: boolean }) {
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <Heading id="tekneler" eyebrow="Öne çıkan tekneler" title="Sizin için seçtiklerimiz" action={{ href: "/tekneler", label: "Tüm tekneler" }} />
        {sample && <p className="-mt-4 mb-6 text-sm text-navy/50">Örnek içerik: Veritabanı bağlı olmadığı için örnek tekneler gösteriliyor.</p>}
        {items.length === 0 ? (
          <p className="rounded-3xl bg-mist p-8 text-center text-navy/70">Henüz yayında tekne yok. Çok yakında burada olacak.</p>
        ) : (
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0">
            {items.map((b) => (
              <div key={b.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
                <BoatCard b={b} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["1", "Tekneyi seçin", "Bölge, tarih, kişi sayısı ve bütçenize göre tekneleri filtreleyin."],
    ["2", "Talebinizi iletin", "Tarih ve kişi sayınızla rezervasyon talebi oluşturun. Talep ücretsizdir."],
    ["3", "Onayı bekleyin", "Müsaitlik ve fiyat teyit edilir. Rezervasyon, onaydan sonra kesinleşir."],
  ];
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <div className="rounded-[2rem] bg-mist p-6 sm:p-10 lg:p-14">
          <Heading eyebrow="Nasıl çalışır?" title="Üç adımda talebinizi iletin" />
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map(([n, t, d]) => (
              <li key={n} className="relative rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-turquoise text-lg font-semibold text-white">{n}</span>
                <h3 className="mt-5 text-lg font-semibold text-navy">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Destinations({ items }: { items: Destination[] }) {
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <Heading id="destinasyonlar" eyebrow="Destinasyonlar" title="Popüler tekne kiralama destinasyonları" action={{ href: "/destinasyonlar", label: "Hepsini gör" }} />
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
          {items.map((d) => (
            <Link
              key={d.slug}
              href={`/destinasyonlar/${d.slug}`}
              className="group relative aspect-[4/5] w-[76%] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[42%] lg:w-[23.5%]"
            >
              {d.image ? (
                <Photo src={d.image} alt={d.name} sizes="(min-width:1024px) 24vw, (min-width:640px) 42vw, 76vw" className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <Placeholder hue={d.hue} className="h-full w-full transition duration-500 group-hover:scale-105" label={false} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-sm text-white/85">Türkiye</p>
                <h3 className="font-display text-3xl">{d.name}</h3>
                <p className="mt-1 text-sm text-white/85">{d.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RentalModes() {
  const modes = [
    { title: "Günlük kiralama", text: "Koy turları, doğum günü ve özel organizasyonlar için.", hue: 178, href: "/tekneler?kiralama=gunluk" },
    { title: "Haftalık kiralama", text: "Kabinli mavi yolculuk: kaptan ve mürettebat dahil seçenekler.", hue: 200, href: "/tekneler?kiralama=haftalik" },
    { title: "Lüks yat koleksiyonu", text: "Üst segment yatlar, kişiye özel rota ve hizmet.", hue: 225, href: "/tekneler?tip=L%C3%BCks%20Yat" },
  ];
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <Heading eyebrow="Kiralama seçenekleri" title="İhtiyacınıza göre planlayın" />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {modes.map((m) => (
            <Link key={m.title} href={m.href} className="group relative flex min-h-[15rem] items-end overflow-hidden rounded-3xl p-6 text-white lg:min-h-[19rem] lg:p-8">
              <Placeholder hue={m.hue} className="absolute inset-0 transition duration-500 group-hover:scale-105" label={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
              <div className="relative">
                <h3 className="font-display text-2xl">{m.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/85">{m.text}</p>
                <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy">Tekneleri gör →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Routes() {
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <div className="rounded-[2rem] bg-navy p-6 text-white sm:p-10 lg:p-14">
          <div id="mavi-yolculuk" className="mb-8 scroll-mt-24 max-w-2xl lg:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">Mavi yolculuk</p>
            <h2 className="font-display text-3xl font-medium lg:text-4xl">Klasik rotalar</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
            {routes.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
                <p className="inline-block rounded-full bg-turquoise px-3 py-1 text-xs font-semibold">{r.days}</p>
                <h3 className="font-display mt-4 text-2xl">{r.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{r.stops}</p>
              </div>
            ))}
          </div>
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
    <section className="py-14 lg:py-20" id="hakkimizda">
      <div className={wrap}>
        <Heading eyebrow="Neden yatpaketi?" title="Güvenle seçin, rahatça yolculuk yapın" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-3xl bg-white p-6 ring-1 ring-navy/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-turquoise/15">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f95a4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
              <h3 className="font-semibold text-navy">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/65">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Blog({ items }: { items: Post[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-14 lg:py-20" id="blog">
      <div className={wrap}>
        <Heading eyebrow="Yatpaketi Rehberi" title="Okuyun, planlayın" action={{ href: "/rehber", label: "Tüm yazılar" }} />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {items.map((p, i) => <PostCard key={p.slug} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

export async function Footer() {
  const [c, nav] = await Promise.all([getContact(), getNavInfo()]);
  const links = [
    { href: "/tekneler", label: "Kiralık Tekneler" },
    { href: "/destinasyonlar", label: "Destinasyonlar" },
    ...(nav.hasGuides ? [{ href: "/rehber", label: "Yatpaketi Rehberi" }] : []),
    ...(nav.hasBlog ? [{ href: "/blog", label: "Blog" }] : []),
    ...nav.pages.map((p) => ({ href: postHref({ kind: "page", slug: p.slug }), label: p.title })),
  ];
  return (
    <footer id="iletisim" className="scroll-mt-20 bg-navy py-12 text-sm text-white/70">
      <ContactBubble whatsapp={c.whatsapp} phone={c.phone} phoneLabel={formatPhone(c.phone)} email={c.email} />
      <div className={`${wrap} flex flex-col justify-between gap-6 md:flex-row`}>
        <div>
          <div className="inline-block rounded-xl bg-white px-4 py-2"><Logo height={32} /></div>
          <p className="mt-2 max-w-xs">Türkiye’de yat ve tekne kiralama platformu.</p>
          {(c.phone || c.email) && (
            <p className="mt-3 flex flex-col gap-1">
              {c.phone && <a href={`tel:+${c.phone}`} className="hover:text-white">{formatPhone(c.phone)}</a>}
              {c.email && <a href={`mailto:${c.email}`} className="break-all hover:text-white">{c.email}</a>}
            </p>
          )}
        </div>
        <ul className="flex flex-col gap-2 md:items-end">
          {links.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
          <li><Link href="/musteri" className="hover:text-white">Müşteri Girişi</Link></li>
        </ul>
      </div>
      <p className={`${wrap} mt-8 border-t border-white/10 pt-6`}>© {new Date().getFullYear()} yatpaketi. Tüm hakları saklıdır.</p>
    </footer>
  );
}
