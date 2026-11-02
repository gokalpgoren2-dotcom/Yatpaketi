import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  new: "Yeni", contacted: "İletişim kuruldu", offered: "Teklif verildi", confirmed: "Onaylandı", cancelled: "İptal",
};

type Req = { id: string; customer_name: string; boat_name: string | null; email: string | null; phone: string | null; status: string; source?: string | null; start_date: string | null; end_date: string | null; created_at: string };
type Portal = { id: string; email: string; boat_name: string; tour_start: string; status: string; signed_at: string | null };
type Item = { portal_id: string; done: boolean };

const dayMs = 86400000;
const toMs = (d: string) => new Date(d + "T00:00:00Z").getTime();
const short = (d: string | null) => (d ? new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : "—");

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const daysTo = (d: string) => Math.round((toMs(d) - toMs(today)) / dayMs);

  const [boatsAll, boatsPub, reqRes, portalRes] = await Promise.all([
    supabase.from("boats").select("id", { count: "exact", head: true }),
    supabase.from("boats").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("reservation_requests").select("*").neq("status", "cancelled").order("created_at", { ascending: false }).limit(1000),
    supabase.from("customer_portals").select("id,email,boat_name,tour_start,status,signed_at"),
  ]);
  const reqs = (reqRes.data ?? []) as Req[];
  const portals = ((portalRes.data ?? []) as Portal[]).filter((p) => p.status === "active");
  const ids = portals.map((p) => p.id);
  const { data: cData } = ids.length ? await supabase.from("portal_checklist").select("portal_id,done").in("portal_id", ids) : { data: [] };
  const items = (cData ?? []) as Item[];

  const confirmed = reqs.filter((r) => r.status === "confirmed");
  const dated = confirmed.filter((r) => r.start_date && r.end_date) as (Req & { start_date: string; end_date: string })[];
  const undated = confirmed.filter((r) => !r.start_date || !r.end_date);
  const upcoming = dated.filter((r) => r.end_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const nowOn = upcoming.filter((r) => r.start_date <= today);
  const coming = upcoming.filter((r) => r.start_date > today);
  const portalOf = (r: Req) => portals.find((p) => r.email && p.email.toLowerCase() === r.email.toLowerCase() && p.tour_start === r.start_date && (p.boat_name === r.boat_name || !r.boat_name));
  const prog = (id: string) => { const l = items.filter((i) => i.portal_id === id); return { done: l.filter((i) => i.done).length, total: l.length }; };

  // Yapılacaklar: acil olandan aza doğru.
  const todo: { text: string; href: string; tone: "red" | "amber" | "blue" }[] = [];
  const fresh = reqs.filter((r) => r.status === "new");
  if (fresh.length) todo.push({ text: `${fresh.length} yeni talep yanıt bekliyor`, href: "/admin/rezervasyonlar", tone: "red" });
  const waiting = reqs.filter((r) => r.status === "contacted" || r.status === "offered");
  if (waiting.length) todo.push({ text: `${waiting.length} talep sonuçlanmayı bekliyor (iletişim kuruldu / teklif verildi)`, href: "/admin/rezervasyonlar", tone: "blue" });
  if (undated.length) todo.push({ text: `${undated.length} onaylı talepte tarih yok`, href: "/admin/turlar", tone: "amber" });
  for (const r of coming) {
    const d = daysTo(r.start_date);
    const p = portalOf(r);
    if (d <= 30 && !p && r.email) todo.push({ text: `${r.customer_name}: tura ${d} gün var, müşteri paneli açılmadı`, href: "/admin/turlar", tone: d <= 14 ? "red" : "amber" });
    else if (d <= 30 && !p && !r.email) todo.push({ text: `${r.customer_name}: tura ${d} gün var, e-posta yok, panel açılamıyor`, href: "/admin/turlar", tone: "amber" });
    if (p && !p.signed_at && d <= 21) todo.push({ text: `${r.customer_name}: tura ${d} gün var, sözleşme imzalanmadı`, href: `/admin/musteri-panelleri/${p.id}`, tone: d <= 7 ? "red" : "amber" });
    if (p && d <= 7) { const g = prog(p.id); if (g.total > 0 && g.done < g.total) todo.push({ text: `${r.customer_name}: hazırlık ${g.done}/${g.total}, tura ${d} gün var`, href: `/admin/musteri-panelleri/${p.id}`, tone: "amber" }); }
  }
  for (const r of nowOn) if (daysTo(r.end_date) === 0) todo.push({ text: `${r.customer_name}: bugün tur bitiyor (${r.boat_name ?? "yat"})`, href: "/admin/turlar", tone: "blue" });
  for (const r of coming) if (daysTo(r.start_date) === 0) todo.push({ text: `${r.customer_name}: bugün giriş (${r.boat_name ?? "yat"})`, href: "/admin/turlar", tone: "red" });

  const in7 = coming.filter((r) => daysTo(r.start_date) <= 7).length;
  const out7 = upcoming.filter((r) => daysTo(r.end_date) <= 7).length;
  const next = coming.slice(0, 5);
  const latest = reqs.slice(0, 5);
  const tone = { red: "bg-red-50 text-red-800 ring-red-200", amber: "bg-amber-50 text-amber-900 ring-amber-200", blue: "bg-navy/5 text-navy ring-navy/10" } as const;

  const cards: [string, number, string][] = [
    ["Şu an turda", nowOn.length, "/admin/turlar"], ["7 günde giriş", in7, "/admin/turlar"], ["7 günde çıkış", out7, "/admin/turlar"], ["Yeni talep", fresh.length, "/admin/rezervasyonlar"],
  ];

  return (
    <>
      <h1 className="font-display text-3xl">Genel Bakış</h1>
      <p className="mt-1 text-sm text-navy/60">{new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" })}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v, href]) => (
          <Link key={k} href={href} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{k}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{v}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Bugün yapılacaklar</h2>
        {todo.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">Şu an bekleyen iş yok. 🎉</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {todo.map((t, i) => (
              <li key={i}><Link href={t.href} className={`block rounded-xl px-4 py-3 text-sm font-medium ring-1 ${tone[t.tone]}`}>{t.text} <span aria-hidden>→</span></Link></li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Yaklaşan turlar</h2>
          <Link href="/admin/turlar" className="text-sm font-medium text-turquoise-dark">Hepsi →</Link>
        </div>
        {nowOn.length === 0 && next.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">Yaklaşan onaylı tur yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/10">
            {[...nowOn, ...next].map((r) => {
              const p = portalOf(r); const on = r.start_date <= today;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="min-w-0"><b>{r.customer_name}</b> · {r.boat_name ?? "Yat belirtilmedi"}<span className="block text-navy/60">{short(r.start_date)} → {short(r.end_date)}</span></span>
                  <span className="flex flex-wrap gap-1 text-xs font-semibold">
                    <span className={`rounded-full px-3 py-1 ${on ? "bg-turquoise text-white" : "bg-navy/10 text-navy"}`}>{on ? "Turda" : `${daysTo(r.start_date)} gün kaldı`}</span>
                    {p ? <span className={`rounded-full px-3 py-1 ${p.signed_at ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{p.signed_at ? "İmzalı" : "İmzasız"}</span> : <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Panel yok</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Son talepler</h2>
        {latest.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">Henüz rezervasyon talebi yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/10">
            {latest.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">{r.customer_name}{r.source === "whatsapp" && <span className="ml-2 rounded-full bg-[#25D366]/15 px-2 py-0.5 text-xs font-semibold text-[#128C7E]">WhatsApp</span>} · {r.boat_name ?? "Yat belirtilmedi"}</span>
                <span className="shrink-0 text-navy/60">{statusLabel[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-sm text-navy/60">Siteniz: {boatsPub.count ?? 0} yayında yat ({boatsAll.count ?? 0} toplam).</p>
      <p className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/rezervasyonlar" className="inline-block rounded-xl bg-turquoise px-6 py-3 text-sm font-semibold text-white">Talepleri gör</Link>
        <Link href="/admin/turlar" className="inline-block rounded-xl border border-navy/15 bg-white px-6 py-3 text-sm font-semibold text-navy">Turlar</Link>
        <Link href="/admin/tekneler" className="inline-block rounded-xl border border-navy/15 bg-white px-6 py-3 text-sm font-semibold text-navy">Yatları yönet</Link>
      </p>
    </>
  );
}
