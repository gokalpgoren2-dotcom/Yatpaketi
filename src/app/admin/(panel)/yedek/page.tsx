import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function Backup() {
  const { supabase } = await requireAdmin();
  const count = async (t: string) => (await supabase.from(t).select("id", { count: "exact", head: true })).count ?? 0;
  const [boats, reqs, portals] = await Promise.all([count("boats"), count("reservation_requests"), count("customer_portals")]);
  const btn = "inline-block rounded-xl px-5 py-3 text-sm font-semibold";
  return (
    <>
      <h1 className="font-display text-3xl">Yedek</h1>
      <p className="mt-1 text-sm text-navy/60">Verilerinizin bir kopyasını telefonunuza indirin. Haftada bir indirip iCloud / Dosyalar'a kaydetmeniz önerilir.</p>

      <div className="mt-6 space-y-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Yalnızca veriler (JSON, küçük dosya)</h2>
          <p className="mt-1 text-sm text-navy/60">Tekneler, rezervasyon talepleri, müşteri panelleri, hazırlık listeleri, takvim kapatmaları, yazılar ve site ayarları. Şu an: {boats} tekne, {reqs} talep, {portals} müşteri paneli.</p>
          <a href="/admin/yedek/indir" className={`${btn} mt-3 bg-navy text-white`}>Tam yedeği indir</a>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-2 ring-turquoise/40">
          <h2 className="font-semibold">Tam yedek + belgeler (ZIP)</h2>
          <p className="mt-1 text-sm text-navy/60">Yukarıdaki tüm veriler artı yüklenmiş bütün belgeler: sözleşme PDF'leri, müşterinin imzalı yüklemeleri, karşı imzalı sözleşmeler ve iptal kanıtları. Dosya sayısına göre hazırlanması birkaç on saniye sürebilir; indirme başlayana kadar sayfayı kapatmayın.</p>
          <a href="/admin/yedek/indir?tur=zip" className={`${btn} mt-3 bg-navy text-white`}>Belgelerle birlikte indir (ZIP)</a>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Rezervasyon listesi (Excel / CSV)</h2>
          <p className="mt-1 text-sm text-navy/60">Tüm rezervasyon talepleri, iptal edilenler dahil. Numbers veya Excel ile açılır.</p>
          <a href="/admin/yedek/indir?tur=rezervasyonlar" className={`${btn} mt-3 bg-turquoise text-white`}>Rezervasyonları indir</a>
        </section>
        <section className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          <h2 className="font-semibold">Bilmeniz gerekenler</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ZIP yedeğine tekne fotoğrafları dahil değildir; onlar Supabase depolamasında ayrıca durur. Belgeler (sözleşme, imzalı, iptal kanıtları) ZIP'e dahildir.</li>
            <li>Yedek dosyasında müşterilerin kişisel bilgileri bulunur. Herkese açık bir yere yüklemeyin, kimseyle paylaşmayın.</li>
            <li>Müşteri giriş kodları güvenlik için yedeğe konmaz; geri yükleme gerekirse kodlar yeniden oluşturulur.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
