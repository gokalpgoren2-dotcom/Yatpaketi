import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ContractSection } from "@/components/ContractSection";
import { loadPortal, portalDb } from "@/lib/portal";
import { normalizePhone } from "@/lib/phone";
import { portalLogout } from "../actions";

export const dynamic = "force-dynamic";

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
const istanbulToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const ms = (d: string) => new Date(d + "T00:00:00Z").getTime();

function Ic({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const ICON = {
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  list: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  clock: "M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  cal: "M5 5h14v15H5zM5 10h14M9 3v4M15 3v4",
  chat: "M4 5h16v11H8l-4 4z",
  lock: "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z",
};

export default async function PortalHome() {
  const p = await loadPortal();
  if (!p) redirect("/musteri");

  let contractUrl: string | null = null;
  let downloadUrl: string | null = null;
  const db = portalDb();
  if (p.contract_path) {
    const store = db.storage.from("contracts");
    const [view, dl] = await Promise.all([store.createSignedUrl(p.contract_path, 600), store.createSignedUrl(p.contract_path, 600, { download: "sozlesme" })]);
    contractUrl = view.data?.signedUrl ?? null;
    downloadUrl = dl.data?.signedUrl ?? null;
  }

  // Ekibe ulaşma düğmesi için site ayarlarındaki WhatsApp numarası (herkese açık ayar).
  let whatsapp = "";
  try {
    const { data } = await db.from("site_settings").select("value").eq("key", "contact").maybeSingle();
    whatsapp = normalizePhone(String((data?.value as { whatsapp?: string } | null)?.whatsapp ?? ""));
  } catch { /* numara yoksa düğme gösterilmez */ }

  const today = istanbulToday();
  const days = Math.round((ms(p.tour_start) - ms(today)) / 86400000);
  const over = today > p.tour_end;
  const big = over ? "✓" : days > 1 ? String(days) : days === 1 ? "Yarın" : "Bugün";
  const small = over ? "Tur tamamlandı" : days > 1 ? "gün kaldı" : days === 1 ? "başlıyor" : days === 0 ? "başlıyor" : "Turdasınız";
  const inTour = !over && days < 0;
  const nights = Math.max(1, Math.round((ms(p.tour_end) - ms(p.tour_start)) / 86400000));
  const done = p.checklist.filter((c) => c.done).length;
  const total = p.checklist.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const signed = Boolean(p.signed_at);
  const hasLoc = p.lat != null && p.lng != null;
  const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Merhaba, ${p.boat_name} rezervasyonum hakkında yazıyorum.`)}` : "";

  const tiles = [
    { href: "#sozlesme", icon: ICON.doc, label: "Sözleşme", value: !p.contract_path ? "Hazırlanıyor" : signed ? "İmzalandı" : "İmza bekliyor", ok: signed },
    { href: "#hazirlik", icon: ICON.list, label: "Hazırlık", value: total ? `${done}/${total} tamam` : "—", ok: total > 0 && done === total },
    { href: "#konum", icon: ICON.pin, label: "Konum", value: hasLoc ? "Açıldı" : p.location_open ? "Yakında" : "Kapalı", ok: hasLoc },
  ];

  const card = "scroll-mt-4 rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(6,38,75,0.06),0_8px_24px_-12px_rgba(6,38,75,0.12)] ring-1 ring-navy/5 sm:p-6";
  const head = (icon: string, title: string, right?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display flex items-center gap-3 text-xl text-navy">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-turquoise/12 text-turquoise-dark"><Ic d={icon} /></span>
        {title}
      </h2>
      {right}
    </div>
  );

  return (
    <div className="min-h-screen bg-mist pb-12">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
        <Link href="/" aria-label="Ana sayfa"><Logo height={34} /></Link>
        <form action={portalLogout}><button type="submit" className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy">Çıkış</button></form>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-5">
        {/* Kahraman kart */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] p-6 text-white shadow-[0_20px_40px_-20px_rgba(6,38,75,0.6)]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-turquoise/25 blur-3xl" />
          <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.12]" viewBox="0 0 400 60" preserveAspectRatio="none" height="60"><path d="M0 30c40-20 80 20 120 0s80-20 120 0 80 20 120 0 40-10 40-10v40H0z" fill="#fff" /></svg>
          <div className="relative">
            <p className="flex items-center gap-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Rezervasyon onaylandı</span>
            </p>
            <p className="mt-4 text-base text-white/80">{p.customer_name ? `Merhaba ${p.customer_name},` : "Merhaba,"}</p>
            <h1 className="font-display mt-0.5 text-[32px] leading-tight">{p.boat_name}</h1>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm text-white/85"><Ic d={ICON.cal} size={18} />{fmtShort(p.tour_start)} → {fmtShort(p.tour_end)} {p.tour_end.slice(0, 4)}</p>
                <p className="mt-1 pl-[26px] text-xs text-white/60">{nights} gece</p>
              </div>
              <div className="min-w-[96px] rounded-2xl bg-white/12 px-4 py-3 text-center backdrop-blur">
                <p className="font-display text-4xl leading-none">{big}</p>
                <p className="mt-1 text-xs text-white/75">{inTour ? "Keyifli tatiller" : small}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Durum özeti */}
        <nav aria-label="Adımlar" className="grid grid-cols-3 gap-2.5">
          {tiles.map((t) => (
            <a key={t.label} href={t.href} className="rounded-2xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(6,38,75,0.06)] ring-1 ring-navy/5 active:scale-[0.98]">
              <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${t.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}><Ic d={t.ok ? ICON.check : t.icon} size={18} /></span>
              <p className="mt-2 text-xs font-semibold text-navy">{t.label}</p>
              <p className={`mt-0.5 text-[11px] leading-tight ${t.ok ? "text-emerald-700" : "text-navy/55"}`}>{t.value}</p>
            </a>
          ))}
        </nav>

        {/* Sıradaki adım */}
        {p.contract_path && !signed && (
          <a href="#sozlesme" className="flex items-center gap-3 rounded-2xl bg-turquoise/12 p-4 ring-1 ring-turquoise/30">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turquoise text-white"><Ic d={ICON.doc} /></span>
            <span className="min-w-0 text-sm"><b className="block text-navy">Sıradaki adım</b><span className="text-navy/70">Sözleşmeyi indirip imzalayın ve buradan yükleyin.</span></span>
            <span aria-hidden className="ml-auto text-navy/40">↓</span>
          </a>
        )}

        {/* Sözleşme */}
        <section id="sozlesme" className={card}>
          {head(ICON.doc, "Sözleşme", signed ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">İmzalandı</span> : undefined)}
          <ContractSection viewUrl={contractUrl} downloadUrl={downloadUrl} signedAt={p.signed_at} />
        </section>

        {/* Hazırlık */}
        <section id="hazirlik" className={card}>
          {head(ICON.list, "Tur hazırlığı", <span className="text-sm font-semibold text-navy/60">{done}/{total}</span>)}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy/8" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Hazırlık ilerlemesi">
            <div className="h-full rounded-full bg-gradient-to-r from-turquoise to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-navy/55">Her adım tamamlandığında e-posta ile haber veririz.</p>
          <ul className="mt-4 space-y-2.5">
            {p.checklist.map((c) => (
              <li key={c.label} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ${c.done ? "bg-emerald-50 ring-1 ring-emerald-100" : "bg-mist ring-1 ring-navy/5"}`}>
                <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-emerald-500 text-white" : "border-2 border-navy/20 text-navy/30"}`}>{c.done ? <Ic d={ICON.check} size={16} /> : <Ic d={ICON.clock} size={14} />}</span>
                <span className={`text-[15px] ${c.done ? "font-medium text-navy" : "text-navy/70"}`}>{c.label}<span className="sr-only">{c.done ? " (tamamlandı)" : " (bekliyor)"}</span></span>
                <span className={`ml-auto shrink-0 text-xs font-semibold ${c.done ? "text-emerald-700" : "text-navy/45"}`}>{c.done ? "Tamam" : "Bekliyor"}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Konum */}
        <section id="konum" className={card}>
          {head(ICON.pin, "Teknenin konumu")}
          {hasLoc ? (
            <>
              <iframe
                title="Teknenin konumu"
                loading="lazy"
                className="mt-4 h-72 w-full rounded-2xl border-0 ring-1 ring-navy/10"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng! - 0.03}%2C${p.lat! - 0.02}%2C${p.lng! + 0.03}%2C${p.lat! + 0.02}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
              />
              {p.location_text && <p className="mt-3 text-base font-medium text-navy">{p.location_text}</p>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a href={`https://maps.apple.com/?daddr=${p.lat},${p.lng}`} target="_blank" rel="noopener" className="rounded-xl bg-navy px-4 py-3 text-center text-sm font-semibold text-white">Apple Haritalar'da aç</a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noopener" className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-center text-sm font-semibold text-navy">Google Haritalar'da aç</a>
              </div>
              {p.location_updated_at && <p className="mt-3 text-xs text-navy/50">Son güncelleme: {new Date(p.location_updated_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" })}. Konum ekibimiz tarafından işaretlenir, canlı takip değildir.</p>}
            </>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-mist p-4 ring-1 ring-navy/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy/50 ring-1 ring-navy/10"><Ic d={p.location_open ? ICON.clock : ICON.lock} /></span>
              <p className="text-sm leading-relaxed text-navy/70">
                {p.location_open ? "Konum bilgisi henüz girilmedi. Ekibimiz girdiğinde burada görünecek." : "Teknenin konumu, turunuzdan yaklaşık 12 saat önce burada açılır."}
              </p>
            </div>
          )}
        </section>

        {/* İletişim */}
        <section className="rounded-3xl bg-navy p-5 text-white sm:p-6">
          <h2 className="font-display flex items-center gap-3 text-xl"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12"><Ic d={ICON.chat} /></span>Bir sorunuz mu var?</h2>
          <p className="mt-2 text-sm text-white/75">Ekibimiz yardımcı olmaktan memnuniyet duyar.</p>
          {wa && <a href={wa} target="_blank" rel="noopener" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-semibold text-white">WhatsApp'tan yazın</a>}
        </section>

        <p className="px-2 pb-2 text-center text-xs leading-relaxed text-navy/50">Turunuz bittiğinde, deneyiminizi ve isterseniz bir fotoğrafınızı paylaşabilmeniz için e-posta adresinize bir yorum bağlantısı göndereceğiz.</p>
      </main>
    </div>
  );
}
