import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ContractSection } from "@/components/ContractSection";
import { ReviewForm } from "@/components/ReviewForm";
import { loadExtras, loadPortal, portalDb } from "@/lib/portal";
import { PrefsForm } from "@/components/turum/PrefsForm";
import { GuestsForm } from "@/components/turum/GuestsForm";
import { MenusPicker } from "@/components/turum/MenusPicker";
import { ShoppingAnswer } from "@/components/turum/ShoppingAnswer";
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
  users: "M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20M10 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1.5a3.5 3.5 0 00-2.5-3.35M15.5 4.6a3.5 3.5 0 010 6.8",
  heart: "M12 20s-8-4.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6.5-8 11-8 11z",
  menu: "M7 3v8M5 3v4a2 2 0 004 0V3M7 11v10M17 3c-1.7 1-3 3.2-3 6v4h3v8",
  bag: "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2",
  star: "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z",
};

export default async function PortalHome() {
  const p = await loadPortal();
  if (!p) redirect("/musteri");

  const extras = await loadExtras();
  let contractUrl: string | null = null;
  let downloadUrl: string | null = null;
  const db = portalDb();
  if (p.contract_path) {
    const store = db.storage.from("contracts");
    const [view, dl] = await Promise.all([store.createSignedUrl(p.contract_path, 600), store.createSignedUrl(p.contract_path, 600, { download: "sozlesme" })]);
    contractUrl = view.data?.signedUrl ?? null;
    downloadUrl = dl.data?.signedUrl ?? null;
  }

  // Menü ve alışveriş dosyaları için kısa süreli bağlantılar
  const fileStore = db.storage.from("portal-files");
  const signFile = async (path: string | null, dl?: string) => (path ? (await fileStore.createSignedUrl(path, 1800, dl ? { download: dl } : undefined)).data?.signedUrl ?? null : null);
  const menuUrls: Record<string, string> = {};
  const fileUrls: Record<string, string> = {};
  if (extras) {
    await Promise.all([
      ...extras.menus.map(async (m) => { const u = await signFile(m.file_path); if (u) menuUrls[m.id] = u; }),
      ...extras.files.map(async (f) => {
        // Excel tarayıcıda açılmaz: indirme bağlantısı verilir
        const ext = (f.path ?? "").split(".").pop()?.toLowerCase() ?? "";
        const u = await signFile(f.path, ["xlsx", "xls", "csv"].includes(ext) ? `alisveris-listesi.${ext}` : undefined);
        if (u) fileUrls[f.id] = u;
      }),
    ]);
  }

  // Ekibe ulaşma düğmesi için site ayarlarındaki WhatsApp numarası (herkese açık ayar).
  let whatsapp = "";
  let contactEmail = "";
  try {
    const { data } = await db.from("site_settings").select("value").eq("key", "contact").maybeSingle();
    whatsapp = normalizePhone(String((data?.value as { whatsapp?: string } | null)?.whatsapp ?? ""));
    contactEmail = String((data?.value as { email?: string } | null)?.email ?? "").trim();
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

  // Misafirin yapacakları ve durumları
  const guestsN = extras?.guests.length ?? 0;
  const prefsDone = Boolean(extras && Object.keys(extras.prefs ?? {}).length > 0);
  const menusN = extras?.menus.filter((m) => m.chosen).length ?? 0;
  const hasMenus = (extras?.menus.length ?? 0) > 0;
  const shopLists = extras?.files.filter((f) => f.kind !== "receipt") ?? [];
  const shopN = shopLists.length;
  const shopWaiting = shopLists.filter((f) => !f.approved_at).length;
  type Task = { id: string; icon: string; label: string; value: string; ok: boolean; show: boolean };
  const tasks: Task[] = [
    { id: "sozlesme", icon: ICON.doc, label: "Sözleşmeyi imzalayın", value: !p.contract_path ? "Hazırlanıyor" : signed ? "İmzalandı" : "İmza bekliyor", ok: signed, show: true },
    { id: "misafirler", icon: ICON.users, label: "Misafir listesi", value: guestsN ? `${guestsN} kişi eklendi` : "Bekleniyor", ok: guestsN > 0, show: Boolean(extras) },
    { id: "tercihler", icon: ICON.heart, label: "Tercihleriniz", value: prefsDone ? "Kaydedildi" : "Bekleniyor", ok: prefsDone, show: Boolean(extras) },
    { id: "menuler", icon: ICON.menu, label: "Menü seçimi", value: !hasMenus ? "Yakında" : menusN ? `${menusN} menü seçildi` : "Bekleniyor", ok: menusN > 0, show: Boolean(extras) },
    { id: "alisveris", icon: ICON.bag, label: "Alışveriş listesi onayı", value: !shopN ? "Hazırlanıyor" : shopWaiting ? "Onayınızı bekliyor" : "Onaylandı", ok: shopN > 0 && !shopWaiting, show: Boolean(extras) },
  ].filter((t) => t.show);
  const myDone = tasks.filter((t) => t.ok).length;
  const nextTask = tasks.find((t) => !t.ok && !(t.id === "sozlesme" && !p.contract_path) && !(t.id === "menuler" && !hasMenus) && !(t.id === "alisveris" && !shopN));

  const card = "scroll-mt-20 rounded-3xl bg-white shadow-[0_1px_2px_rgba(6,38,75,0.06),0_8px_24px_-12px_rgba(6,38,75,0.12)] ring-1 ring-navy/5";
  const pad = "p-5 sm:p-6";
  const chip = (ok: boolean, text: string) => <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{text}</span>;
  const neutral = (text: string) => <span className="shrink-0 rounded-full bg-navy/[0.07] px-3 py-1 text-xs font-semibold text-navy/60">{text}</span>;
  const head = (icon: string, title: string, right?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display flex items-center gap-3 text-xl text-navy">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-turquoise/12 text-turquoise-dark"><Ic d={icon} /></span>
        {title}
      </h2>
      {right}
    </div>
  );
  // Açılır kapanır bölüm: tamamlananlar kapalı gelir, sayfa kısa kalır
  const fold = (id: string, icon: string, title: string, right: React.ReactNode, open: boolean, body: React.ReactNode, sub?: string) => (
    <details id={id} open={open || undefined} className={`group ${card}`}>
      <summary className={`flex cursor-pointer list-none items-center gap-3 ${pad} [&::-webkit-details-marker]:hidden`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-turquoise/12 text-turquoise-dark"><Ic d={icon} /></span>
        <span className="min-w-0 flex-1">
          <span className="font-display block text-xl leading-tight text-navy">{title}</span>
          {sub && <span className="mt-0.5 block text-xs text-navy/50">{sub}</span>}
        </span>
        {right}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-navy/35 transition group-open:rotate-180"><path d="M6 9l6 6 6-6" /></svg>
      </summary>
      <div className="-mt-2 px-5 pb-5 sm:px-6 sm:pb-6">{body}</div>
    </details>
  );
  const groupTitle = (t: string) => <p className="px-1 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy/45">{t}</p>;

  const reviewSection = (
    <section id="yorum" className={`${card} ${pad}`}>
      {head(ICON.star, "Tur yorumu", p.review_done ? chip(true, "Gönderildi") : !p.review_open ? neutral("Kapalı") : undefined)}
      {p.review_done ? (
        <p className="mt-4 text-sm leading-relaxed text-navy/70">Yorumunuz için teşekkür ederiz. Ekibimiz inceledikten sonra sitede yayınlanacak.</p>
      ) : p.review_open ? (
        <div className="mt-4">
          <p className="mb-5 text-sm leading-relaxed text-navy/70">Turunuz nasıldı? Deneyiminizi ve isterseniz bir fotoğrafınızı paylaşın, sonraki misafirlerimize yol gösterin.</p>
          <ReviewForm token={null} lang="tr" defaultName={p.customer_name ?? ""} />
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-navy/60">Turunuz bittikten sonra ekibimiz burada yorum bölümünü açar.</p>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-mist pb-12">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
        <Link href="/" aria-label="Ana sayfa"><Logo height={34} /></Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-navy px-3 py-1.5 text-xs font-bold tracking-wider text-turquoise">TURUM</span>
          <form action={portalLogout}><button type="submit" className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy">Çıkış</button></form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-5">
        {/* Karşılama */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] p-6 text-white shadow-[0_20px_40px_-20px_rgba(6,38,75,0.6)]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-turquoise/25 blur-3xl" />
          <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.12]" viewBox="0 0 400 60" preserveAspectRatio="none" height="60"><path d="M0 30c40-20 80 20 120 0s80-20 120 0 80 20 120 0 40-10 40-10v40H0z" fill="#fff" /></svg>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/85"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Rezervasyon onaylandı</span>
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

        {/* Tur bittiyse önce yorum */}
        {over && reviewSection}

        {/* Yapılacaklar özeti */}
        {!over && (
          <section className={`${card} ${pad}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl text-navy">Turdan önce sizden istediklerimiz</h2>
              <span className="shrink-0 text-sm font-semibold text-navy/55">{myDone}/{tasks.length}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/8"><div className="h-full rounded-full bg-gradient-to-r from-turquoise to-emerald-400" style={{ width: `${tasks.length ? Math.round((myDone / tasks.length) * 100) : 0}%` }} /></div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {tasks.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition active:scale-[0.99] ${t.ok ? "bg-emerald-50 ring-emerald-100" : "bg-mist ring-navy/5 hover:ring-turquoise/40"}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.ok ? "bg-emerald-500 text-white" : "bg-white text-turquoise-dark ring-1 ring-navy/10"}`}><Ic d={t.ok ? ICON.check : t.icon} size={17} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-navy">{t.label}</span>
                      <span className={`block text-xs ${t.ok ? "text-emerald-700" : "text-navy/55"}`}>{t.value}</span>
                    </span>
                    {!t.ok && <span aria-hidden className="text-navy/30">›</span>}
                  </a>
                </li>
              ))}
            </ul>
            {nextTask && (
              <a href={`#${nextTask.id}`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3.5 text-sm font-semibold text-white">
                Sıradaki: {nextTask.label} ↓
              </a>
            )}
          </section>
        )}

        {!over && groupTitle("Sizden beklenenler")}

        {/* Sözleşme */}
        <section id="sozlesme" className={`${card} ${pad}`}>
          {head(ICON.doc, "Sözleşme", signed ? chip(true, "İmzalandı") : p.contract_path ? chip(false, "İmza bekliyor") : neutral("Hazırlanıyor"))}
          <ContractSection viewUrl={contractUrl} downloadUrl={downloadUrl} signedAt={p.signed_at} />
        </section>

        {extras && !over && (
          <>
            {fold("misafirler", ICON.users, "Misafir listesi", guestsN ? chip(true, `${guestsN} kişi`) : chip(false, "Bekleniyor"), guestsN === 0, (
              <>
                <div className="rounded-2xl bg-turquoise/10 p-4 text-sm leading-relaxed text-navy ring-1 ring-turquoise/25">
                  <b>Neden gerekli?</b> Yatın tur öncesi limandan çıkış yapabilmesi için tüm misafirlerin bilgileri <b>transit log</b> kaydına girilmelidir. Lütfen yatta bulunacak herkesi, kimlik veya pasaportundaki bilgilerle, turdan en az 3 gün önce ekleyin. Bilgileriniz KVKK kapsamında yalnızca bu amaçla kullanılır.
                </div>
                <GuestsForm initial={extras.guests} consented={Boolean(extras.kvkk_info_at)} email={contactEmail} />
              </>
            ), "Transit log için gerekli")}

            {fold("tercihler", ICON.heart, "Misafir tercihleri", prefsDone ? chip(true, "Kaydedildi") : chip(false, "Bekleniyor"), !prefsDone, (
              <>
                <p className="text-sm leading-relaxed text-navy/70">Size en uygun turu hazırlayabilmemiz için birkaç tercihinizi öğrenmek istiyoruz. İstediğiniz zaman değiştirebilirsiniz.</p>
                <PrefsForm initial={extras.prefs} tourStart={p.tour_start} tourEnd={p.tour_end} consented={Boolean(extras.kvkk_health_at)} email={contactEmail} />
              </>
            ), "Market, sağlık, kutlama, hizmet tarzı, aktiviteler")}

            {fold("menuler", ICON.menu, "Menüler", !hasMenus ? neutral("Yakında") : menusN ? chip(true, `${menusN} seçildi`) : chip(false, "Bekleniyor"), hasMenus && menusN === 0, hasMenus ? (
              <>
                <p className="text-sm leading-relaxed text-navy/70">Şefimizin hazırladığı menülerden beğendiklerinizi seçin. Kumanya ve yemek planı seçiminize göre hazırlanır.</p>
                <MenusPicker menus={extras.menus} urls={menuUrls} />
              </>
            ) : (
              <p className="rounded-2xl bg-mist p-4 text-sm leading-relaxed text-navy/70 ring-1 ring-navy/5">Menüler ekibimiz tarafından yakında buraya eklenecek. Eklendiğinde beğendiklerinizi seçebileceksiniz.</p>
            ))}
          </>
        )}

        {/* Alışveriş listesi: ekip yükler, misafir onaylar */}
        {extras && (() => {
          const lists = extras.files.filter((f) => f.kind !== "receipt");
          const waiting = lists.filter((f) => !f.approved_at).length;
          return (
            <section id="alisveris" className={`${card} ${pad}`}>
              {head(ICON.bag, "Alışveriş listesi", !lists.length ? neutral("Henüz yok") : waiting ? chip(false, "Onayınızı bekliyor") : chip(true, "Onaylandı"))}
              {lists.length ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-navy/70">Tercihlerinize ve menü seçiminize göre hazırladığımız alışveriş listesini inceleyin. Onayınızdan sonra alışveriş yapılır.</p>
                  <ul className="mt-4 space-y-3">
                    {lists.map((f) => (
                      <li key={f.id} className={`rounded-2xl p-4 ring-1 ${f.approved_at ? "bg-emerald-50/50 ring-emerald-100" : "bg-mist ring-navy/5"}`}>
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-turquoise-dark ring-1 ring-navy/10"><Ic d={ICON.bag} size={18} /></span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-navy">{f.title}</p>
                            <p className="text-xs text-navy/50">{new Date(f.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
                          </div>
                        </div>
                        {f.note && <p className="mt-3 whitespace-pre-line rounded-xl bg-white p-3.5 text-sm leading-relaxed text-navy/80 ring-1 ring-navy/5">{f.note}</p>}
                        {fileUrls[f.id] && (() => {
                          const xl = /\.(xlsx|xls|csv)$/i.test(f.path ?? "");
                          return (
                            <a href={fileUrls[f.id]} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:ring-turquoise">
                              <Ic d={ICON.doc} size={16} />{xl ? "Listeyi indir (Excel)" : "Listeyi aç (PDF)"}
                            </a>
                          );
                        })()}
                        {!over && <ShoppingAnswer id={f.id} approvedAt={f.approved_at} changeAt={f.change_requested_at} note={f.customer_note} />}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-navy/60">Alışveriş listeniz hazırlandığında burada görünecek. Onayınızdan sonra alışveriş yapılır.</p>
              )}
            </section>
          );
        })()}

        {!over && groupTitle("Ekibimizin hazırlıkları")}

        {/* Hazırlık */}
        {!over && <section id="hazirlik" className={`${card} ${pad}`}>
          {head(ICON.list, "Tur hazırlığı", <span className="text-sm font-semibold text-navy/60">{done}/{total}</span>)}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy/8" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Hazırlık ilerlemesi">
            <div className="h-full rounded-full bg-gradient-to-r from-turquoise to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-navy/55">Her adım tamamlandığında e-posta ile haber veririz.</p>
          <ul className="mt-4 space-y-2">
            {p.checklist.map((c) => (
              <li key={c.label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${c.done ? "bg-emerald-50 ring-1 ring-emerald-100" : "bg-mist ring-1 ring-navy/5"}`}>
                <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-emerald-500 text-white" : "border-2 border-navy/20 text-navy/30"}`}>{c.done ? <Ic d={ICON.check} size={16} /> : <Ic d={ICON.clock} size={14} />}</span>
                <span className={`text-[15px] ${c.done ? "font-medium text-navy" : "text-navy/70"}`}>{c.label}<span className="sr-only">{c.done ? " (tamamlandı)" : " (bekliyor)"}</span></span>
                <span className={`ml-auto shrink-0 text-xs font-semibold ${c.done ? "text-emerald-700" : "text-navy/45"}`}>{c.done ? "Tamam" : "Bekliyor"}</span>
              </li>
            ))}
          </ul>
        </section>}

        {/* Konum */}
        {!over && <section id="konum" className={`${card} ${pad}`}>
          {head(ICON.pin, "Yatın konumu", hasLoc ? chip(true, "Açıldı") : neutral(p.location_open ? "Yakında" : "Kapalı"))}
          {hasLoc ? (
            <>
              <iframe
                title="Yatın konumu"
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
            <p className="mt-3 text-sm leading-relaxed text-navy/60">
              {p.location_open ? "Konum bilgisi henüz girilmedi. Ekibimiz girdiğinde burada görünecek." : "Yatın konumu, turunuzdan yaklaşık 12 saat önce burada açılır."}
            </p>
          )}
        </section>}

        {/* Tur sürerken / öncesinde yorum en altta */}
        {!over && reviewSection}

        {/* İletişim */}
        <section className="rounded-3xl bg-navy p-5 text-white sm:p-6">
          <h2 className="font-display flex items-center gap-3 text-xl"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12"><Ic d={ICON.chat} /></span>Bir sorunuz mu var?</h2>
          <p className="mt-2 text-sm text-white/75">Ekibimiz yardımcı olmaktan memnuniyet duyar.</p>
          {wa && <a href={wa} target="_blank" rel="noopener" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-semibold text-white">WhatsApp'tan yazın</a>}
        </section>
      </main>
    </div>
  );
}
