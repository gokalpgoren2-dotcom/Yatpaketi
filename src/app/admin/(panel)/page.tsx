import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  new: "Yeni", contacted: "İletişim kuruldu", offered: "Teklif verildi", confirmed: "Onaylandı", cancelled: "İptal",
};

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = (q: any) => q.then((r: { count: number | null }) => r.count ?? 0);
  const [total, published, requests, fresh, latest] = await Promise.all([
    count(supabase.from("boats").select("*", { count: "exact", head: true })),
    count(supabase.from("boats").select("*", { count: "exact", head: true }).eq("is_published", true)),
    count(supabase.from("reservation_requests").select("*", { count: "exact", head: true })),
    count(supabase.from("reservation_requests").select("*", { count: "exact", head: true }).eq("status", "new")),
    supabase.from("reservation_requests").select("id,customer_name,boat_name,status,created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const cards: [string, number][] = [
    ["Toplam tekne", total], ["Yayındaki tekne", published], ["Rezervasyon talebi", requests], ["Yeni talep", fresh],
  ];
  const rows: { id: string; customer_name: string; boat_name: string | null; status: string; created_at: string }[] = latest.data ?? [];

  return (
    <>
      <h1 className="font-display text-3xl">Genel Bakış</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{k}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Son talepler</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-navy/60">Henüz rezervasyon talebi yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy/10">
            {rows.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 py-3 text-sm">
                <span>{r.customer_name} · {r.boat_name ?? "Tekne belirtilmedi"}</span>
                <span className="text-navy/60">{statusLabel[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-6">
        <Link href="/admin/tekneler" className="inline-block rounded-xl bg-turquoise px-6 py-3 text-sm font-semibold text-white">Tekneleri yönet</Link>
      </p>
    </>
  );
}
