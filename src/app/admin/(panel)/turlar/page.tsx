import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Req = { id: string; boat_name: string | null; customer_name: string; phone: string | null; email: string | null; guests: number | null; start_date: string; end_date: string };
type RawReq = { id: string; boat_name: string | null; customer_name: string; phone: string | null; email: string | null; guests: number | null; start_date: string | null; end_date: string | null };
type Portal = { id: string; email: string; boat_name: string; tour_start: string; status: string; signed_at: string | null };
type Item = { portal_id: string; done: boolean };

const WD = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const dayMs = 86400000;
const toMs = (d: string) => new Date(d + "T00:00:00Z").getTime();
const short = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
const long = (d: string) => `${short(d)} ${d.slice(0, 4)} ${WD[new Date(d + "T12:00:00Z").getUTCDay()]}`;

export default async function Tours({ searchParams }: { searchParams: Promise<{ goster?: string }> }) {
  const { goster } = await searchParams;
  const past = goster === "gecmis";
  const { supabase } = await requireAdmin();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

  const { data, error } = await supabase
    .from("reservation_requests")
    .select("id,boat_name,customer_name,phone,email,guests,start_date,end_date")
    .eq("status", "confirmed")
    .order("start_date", { ascending: !past })
    .limit(500);
  const raw = (data ?? []) as RawReq[];
  const nodate = raw.filter((r) => !r.start_date || !r.end_date);
  const all = raw.filter((r) => r.start_date && r.end_date) as Req[];
  const pastCount = all.filter((r) => r.end_date < today).length;
  const rows = past ? all.filter((r) => r.end_date < today) : all.filter((r) => r.end_date >= today);

  // Müşteri paneli, sözleşme ve hazırlık durumu: e-posta + tekne + başlangıç tarihiyle eşleştirilir.
  const { data: pData } = await supabase.from("customer_portals").select("id,email,boat_name,tour_start,status,signed_at");
  const portals = (pData ?? []) as Portal[];
  const ids = portals.map((p) => p.id);
  const { data: cData } = ids.length ? await supabase.from("portal_checklist").select("portal_id,done").in("portal_id", ids) : { data: [] };
  const items = (cData ?? []) as Item[];
  const portalOf = (r: Req) => portals.find((p) => p.status === "active" && r.email && p.email.toLowerCase() === r.email.toLowerCase() && p.tour_start === r.start_date && (p.boat_name === r.boat_name || !r.boat_name));
  const progress = (id: string) => { const l = items.filter((i) => i.portal_id === id); return `${l.filter((i) => i.done).length}/${l.length}`; };

  const now = rows.filter((r) => r.start_date <= today && r.end_date >= today);
  const upcoming = rows.filter((r) => r.start_date > today);
  const week = (d: string) => Math.round((toMs(d) - toMs(today)) / dayMs);
  const in7Start = upcoming.filter((r) => week(r.start_date) <= 7).length;
  const in7End = rows.filter((r) => r.end_date >= today && week(r.end_date) <= 7).length;

  // Giriş tarihine göre grupla (yakından uzağa; geçmişte yeniden eskiye).
  const groups = new Map<string, Req[]>();
  for (const r of past ? rows : upcoming) groups.set(r.start_date, [...(groups.get(r.start_date) ?? []), r]);

  const Card = ({ r }: { r: Req }) => {
    const p = portalOf(r);
    const nights = Math.round((toMs(r.end_date) - toMs(r.start_date)) / dayMs);
    const left = week(r.start_date);
    const when = r.start_date <= today && r.end_date >= today ? "Turda" : left > 0 ? `${left} gün kaldı` : "";
    const newPortal = `/admin/musteri-panelleri/yeni?${new URLSearchParams({ email: r.email ?? "", ad: r.customer_name, tekne: r.boat_name ?? "", bas: r.start_date, bit: r.end_date }).toString()}`;
    return (
      <li className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">{r.customer_name}</p>
            <p className="text-sm text-navy/70">{r.boat_name ?? "Tekne belirtilmedi"}</p>
          </div>
          {when && <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${when === "Turda" ? "bg-turquoise text-white" : "bg-navy/10 text-navy"}`}>{when}</span>}
        </div>
        <p className="mt-2 text-sm"><b>Giriş</b> {short(r.start_date)} → <b>Çıkış</b> {short(r.end_date)} <span className="text-navy/55">· {nights} gece{r.guests ? ` · ${r.guests} kişi` : ""}</span></p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {p ? (
            <>
              <Link href={`/admin/musteri-panelleri/${p.id}`} className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">Müşteri paneli açık</Link>
              <span className={`rounded-full px-3 py-1 font-semibold ${p.signed_at ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{p.signed_at ? "Sözleşme imzalı" : "Sözleşme imzasız"}</span>
              <span className="rounded-full bg-navy/10 px-3 py-1 font-semibold text-navy">Hazırlık {progress(p.id)}</span>
            </>
          ) : r.email ? (
            <Link href={newPortal} className="rounded-full bg-navy px-3 py-1 font-semibold text-white">Müşteri paneli aç</Link>
          ) : <span className="rounded-full bg-navy/10 px-3 py-1 text-navy/70">E-posta yok, panel açılamaz</span>}
          {r.phone && <a href={`tel:${r.phone}`} className="rounded-full border border-navy/15 px-3 py-1 font-semibold text-turquoise-dark">{r.phone}</a>}
        </div>
      </li>
    );
  };

  return (
    <>
      <h1 className="font-display text-3xl">Turlar</h1>
      <p className="mt-1 text-sm text-navy/60">Onaylanan rezervasyonlar, yakından uzağa. Giriş tarihine göre gruplanır.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Okunamadı: {error.message}</p>}

      <nav aria-label="Görünüm" className="mt-5 flex gap-2">
        <a href="?" className={`rounded-full px-4 py-2 text-sm font-medium ${!past ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>Güncel ve gelecek</a>
        <a href="?goster=gecmis" className={`rounded-full px-4 py-2 text-sm font-medium ${past ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>Geçmiş turlar</a>
      </nav>

      {!past && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-2xl font-semibold text-turquoise-dark">{now.length}</p><p className="text-xs text-navy/60">Şu an turda</p></div>
          <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-2xl font-semibold">{in7Start}</p><p className="text-xs text-navy/60">7 günde giriş</p></div>
          <div className="rounded-2xl bg-white p-3 shadow-sm"><p className="text-2xl font-semibold">{in7End}</p><p className="text-xs text-navy/60">7 günde çıkış</p></div>
        </div>
      )}

      {!past && now.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold">Şu an turda</h2>
          <ul className="mt-2 space-y-3">{now.map((r) => <Card key={r.id} r={r} />)}</ul>
        </section>
      )}

      {!past && pastCount > 0 && <p className="mt-4 text-sm text-navy/60">{pastCount} geçmiş tur var. <a href="?goster=gecmis" className="font-semibold text-turquoise-dark underline">Geçmiş turlara bak</a></p>}

      {!past && nodate.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold">Tarihi girilmemiş onaylı talepler <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">{nodate.length}</span></h2>
          <p className="mt-1 text-xs text-navy/60">Tarih yok, bu yüzden sıralanamadı. Rezervasyonlar bölümünden tarihleri kontrol edin.</p>
          <ul className="mt-2 space-y-3">{nodate.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{r.customer_name}</p>
              <p className="text-sm text-navy/70">{r.boat_name ?? "Tekne belirtilmedi"}</p>
              {r.phone && <a href={`tel:${r.phone}`} className="mt-2 inline-block rounded-full border border-navy/15 px-3 py-1 text-xs font-semibold text-turquoise-dark">{r.phone}</a>}
            </li>
          ))}</ul>
        </section>
      )}

      {rows.length === 0 && nodate.length === 0 && <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60 shadow-sm">{past ? "Geçmiş tur yok." : "Onaylanmış gelecek tur yok. Rezervasyonlar bölümünde bir talebi Onaylandı yapınca burada görünür."}</p>}

      {[...groups.entries()].map(([date, list]) => (
        <section key={date} className="mt-6">
          <h2 className="font-semibold">{long(date)} <span className="ml-1 rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise-dark">{list.length} tur giriş</span></h2>
          <ul className="mt-2 space-y-3">{list.map((r) => <Card key={r.id} r={r} />)}</ul>
        </section>
      ))}
    </>
  );
}
