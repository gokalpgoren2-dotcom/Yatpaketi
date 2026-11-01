import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function PageTexts() {
  await requireAdmin();
  const cards = [
    { href: "/admin/sayfa-metinleri/sss", title: "Sıkça Sorulan Sorular", text: "Soruları ve cevapları ekleyin, değiştirin, silin. Türkçe ve İngilizce." },
    { href: "/admin/sayfa-metinleri/kultur", title: "Yat ve Yatçılık Kültürü", text: "Bölüm başlıkları, metinler, incelik kartları ve denizcilik sözlüğü. Türkçe ve İngilizce." },
  ];
  return (
    <>
      <h1 className="font-display text-3xl">Sayfa Metinleri</h1>
      <p className="mt-1 text-sm text-navy/60">Özel tasarımlı sayfaların metinleri buradan düzenlenir. Destinasyonlar, rotalar, kiralama süreci ve blog için <Link href="/admin/yazilar" className="text-turquoise-dark underline">Yazılar</Link> bölümünü kullanın.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 transition hover:ring-turquoise">
            <span className="block font-semibold">{c.title}</span>
            <span className="mt-1 block text-sm text-navy/60">{c.text}</span>
            <span className="mt-3 block text-sm font-semibold text-turquoise-dark">Düzenle →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
