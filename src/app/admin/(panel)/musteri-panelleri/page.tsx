import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Row = { id: string; email: string; customer_name: string | null; boat_name: string; tour_start: string; tour_end: string; status: string; signed_at: string | null };

export default async function Portals({ searchParams }: { searchParams: Promise<{ goster?: string }> }) {
  const { goster } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("customer_portals").select("id,email,customer_name,boat_name,tour_start,tour_end,status,signed_at").order("tour_start", { ascending: false });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const all = (data ?? []) as Row[];
  const isActive = (r: Row) => r.status === "active" && r.tour_end >= today;
  const archive = goster === "arsiv";
  const rows = all.filter((r) => (archive ? !isActive(r) : isActive(r)));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Müşteri Panelleri</h1>
        <Link href="/admin/musteri-panelleri/yeni" className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white">+ Yeni panel</Link>
      </div>
      <p className="mt-1 text-sm text-navy/60">Anlaşılan müşteriler için kodlu giriş. Kod tur bitiş tarihinden sonra çalışmaz.</p>
      <nav aria-label="Filtre" className="mt-5 flex gap-2">
        <a href="?" className={`rounded-full px-4 py-2 text-sm font-medium ${!archive ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>Aktif ({all.filter(isActive).length})</a>
        <a href="?goster=arsiv" className={`rounded-full px-4 py-2 text-sm font-medium ${archive ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>Süresi dolan / iptal ({all.filter((r) => !isActive(r)).length})</a>
      </nav>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Okunamadı: {error.message}. Supabase'e müşteri paneli SQL kodunu yapıştırdınız mı?</p>}
      {rows.length === 0 && !error && <p className="mt-5 rounded-2xl bg-white p-6 text-sm text-navy/60 shadow-sm">Bu görünümde müşteri paneli yok.</p>}
      <ul className="mt-5 divide-y divide-navy/10 rounded-2xl bg-white shadow-sm">
        {rows.map((r) => {
          const state = r.status === "revoked" ? "İptal" : r.tour_end < today ? "Süresi doldu" : "Aktif";
          const cls = state === "Aktif" ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/70";
          return (
            <li key={r.id}>
              <Link href={`/admin/musteri-panelleri/${r.id}`} className="flex items-center justify-between gap-3 p-4">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.customer_name || r.email}</span>
                  <span className="block truncate text-xs text-navy/55">{r.boat_name} · {r.tour_start} → {r.tour_end}{r.signed_at ? " · sözleşme imzalı" : ""}</span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{state}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
