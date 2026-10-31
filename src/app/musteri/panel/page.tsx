import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PortalUpload } from "@/components/PortalUpload";
import { loadPortal, portalDb } from "@/lib/portal";
import { portalLogout } from "../actions";

export const dynamic = "force-dynamic";

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const istanbulToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

export default async function PortalHome() {
  const p = await loadPortal();
  if (!p) redirect("/musteri");

  let contractUrl: string | null = null;
  let downloadUrl: string | null = null;
  if (p.contract_path) {
    const store = portalDb().storage.from("contracts");
    const [view, dl] = await Promise.all([store.createSignedUrl(p.contract_path, 600), store.createSignedUrl(p.contract_path, 600, { download: "sozlesme" })]);
    contractUrl = view.data?.signedUrl ?? null;
    downloadUrl = dl.data?.signedUrl ?? null;
  }

  const days = Math.round((new Date(p.tour_start + "T00:00:00Z").getTime() - new Date(istanbulToday() + "T00:00:00Z").getTime()) / 86400000);
  const countdown = days > 1 ? `Turunuza ${days} gün kaldı` : days === 1 ? "Turunuz yarın başlıyor" : days === 0 ? "Turunuz bugün başlıyor" : "Turunuz devam ediyor";
  const done = p.checklist.filter((c) => c.done).length;
  const total = p.checklist.length;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Ana sayfa"><Logo /></Link>
        <form action={portalLogout}><button type="submit" className="rounded-full border border-navy/20 px-4 py-2 text-sm font-medium text-navy">Çıkış</button></form>
      </div>

      <h1 className="font-display mt-8 text-3xl text-navy">{p.customer_name ? `Merhaba ${p.customer_name}` : "Merhaba"}</h1>
      <section className="mt-5 rounded-3xl bg-navy p-6 text-white">
        <p className="text-sm text-white/70">{countdown}</p>
        <p className="font-display mt-1 text-2xl">{p.boat_name}</p>
        <p className="mt-2 text-sm text-white/80">{fmt(p.tour_start)} – {fmt(p.tour_end)}</p>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/10">
        <h2 className="font-display text-xl text-navy">Sözleşme</h2>
        {contractUrl ? (
          <p className="mt-3 flex flex-wrap gap-2">
            <a href={contractUrl} target="_blank" rel="noopener" className="inline-block rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy">Görüntüle</a>
            {downloadUrl && <a href={downloadUrl} className="inline-block rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy">İndir</a>}
          </p>
        ) : (
          <p className="mt-3 text-sm text-navy/65">Sözleşmeniz hazırlandığında burada görünecek.</p>
        )}
        {contractUrl && (
          <div className="mt-5">
            {p.signed_at ? (
              <p className="mb-3 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">İmzalı sözleşmeniz alındı ({new Date(p.signed_at).toLocaleDateString("tr-TR")}).</p>
            ) : (
              <p className="mb-3 text-sm text-navy/70">Sözleşmeyi indirip imzalayın, sonra imzalı hâlini (PDF veya fotoğraf) buradan yükleyin.</p>
            )}
            <PortalUpload replace={Boolean(p.signed_at)} />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl text-navy">Tur hazırlığı</h2>
          <span className="text-sm text-navy/60">{done} / {total}</span>
        </div>
        <ul className="mt-4 space-y-3">
          {p.checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-3 text-base">
              <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${c.done ? "bg-turquoise text-white" : "border-2 border-navy/20 text-transparent"}`}>✓</span>
              <span className={c.done ? "text-navy" : "text-navy/60"}>{c.label}<span className="sr-only">{c.done ? " (tamamlandı)" : " (bekliyor)"}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/10">
        <h2 className="font-display text-xl text-navy">Tekne şu an nerede?</h2>
        {p.location_text ? (
          <>
            <p className="mt-3 text-base text-navy">{p.location_text}</p>
            {p.location_updated_at && <p className="mt-1 text-xs text-navy/50">Son güncelleme: {new Date(p.location_updated_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" })}. Bu bilgi ekibimiz tarafından elle girilir, canlı harita değildir.</p>}
          </>
        ) : (
          <p className="mt-3 text-sm text-navy/65">Konum bilgisi henüz girilmedi. Ekibimiz güncelledikçe burada görünecek.</p>
        )}
      </section>

      <p className="mt-8 text-center text-sm text-navy/55">Sorularınız için bizimle WhatsApp'tan iletişime geçebilirsiniz.</p>
    </main>
  );
}
