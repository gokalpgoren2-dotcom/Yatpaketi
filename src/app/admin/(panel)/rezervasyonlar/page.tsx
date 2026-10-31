import { requireAdmin } from "@/lib/admin";
import { Notice, SubmitButton } from "@/components/admin/FormBits";
import { markBlocked, updateRequest } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { new: "Yeni", contacted: "İletişim kuruldu", offered: "Teklif verildi", confirmed: "Onaylandı", cancelled: "İptal" };
const tone: Record<string, string> = {
  new: "bg-turquoise text-white", contacted: "bg-navy/10 text-navy", offered: "bg-amber-100 text-amber-900", confirmed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-700",
};

type Req = {
  id: string; boat_id: string | null; boat_name: string | null; customer_name: string; phone: string | null; email: string | null;
  start_date: string | null; end_date: string | null; guests: number | null; message: string | null;
  status: string; admin_notes: string | null; created_at: string;
};

const fmt = (d: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "—");

export default async function Requests({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; t?: string; durum?: string }> }) {
  const { error, saved, t, durum } = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase.from("reservation_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (durum && labels[durum]) q = q.eq("status", durum);
  const { data } = await q;
  const rows = (data ?? []) as Req[];

  return (
    <>
      <h1 className="font-display text-3xl">Rezervasyon talepleri</h1>
      <p className="mt-1 text-sm text-navy/60">Bunlar kesin rezervasyon değil, ziyaretçilerin gönderdiği taleplerdir. Müsaitliği ve fiyatı teyit ettikten sonra durumu güncelleyin.</p>
      {saved && <Notice key={"s" + t} kind="ok" text="Kaydedildi." />}
      {error && <Notice key={"e" + t} kind="error" text={error} />}

      <nav aria-label="Duruma göre filtre" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {[["", "Tümü"], ...Object.entries(labels)].map(([k, v]) => (
          <a key={k} href={k ? `?durum=${k}` : "?"} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${(durum ?? "") === k ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>{v}</a>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60">Bu görünümde talep yok.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white shadow-sm">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-4">
                  <span className="min-w-0">
                    <span className="block font-semibold">{r.customer_name}</span>
                    <span className="block text-sm text-navy/60">{r.boat_name ?? "Tekne belirtilmedi"} · {fmt(r.start_date)} – {fmt(r.end_date)}</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[r.status] ?? "bg-navy/10"}`}>{labels[r.status] ?? r.status}</span>
                </summary>
                <div className="space-y-4 border-t border-navy/10 p-4 text-sm">
                  <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <div><dt className="text-navy/50">Telefon</dt><dd>{r.phone ? <a className="font-medium text-turquoise-dark" href={`tel:${r.phone}`}>{r.phone}</a> : "—"}</dd></div>
                    <div><dt className="text-navy/50">E-posta</dt><dd>{r.email ? <a className="font-medium text-turquoise-dark" href={`mailto:${r.email}`}>{r.email}</a> : "—"}</dd></div>
                    <div><dt className="text-navy/50">Misafir</dt><dd>{r.guests ?? "—"}</dd></div>
                    <div><dt className="text-navy/50">Gönderilme</dt><dd>{new Date(r.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</dd></div>
                  </dl>
                  {r.message && <p className="whitespace-pre-line rounded-xl bg-mist p-3">{r.message}</p>}
                  <form action={updateRequest} className="space-y-3">
                    <input type="hidden" name="id" value={r.id} />
                    <div>
                      <label htmlFor={`st-${r.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Durum</label>
                      <select id={`st-${r.id}`} name="status" defaultValue={r.status} className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base">
                        {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`nt-${r.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Not (yalnızca siz görürsünüz)</label>
                      <textarea id={`nt-${r.id}`} name="admin_notes" rows={2} maxLength={2000} defaultValue={r.admin_notes ?? ""} className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base" />
                    </div>
                    <SubmitButton>Kaydet</SubmitButton>
                  </form>
                  {r.boat_id && r.start_date && r.end_date && (
                    <form action={markBlocked} className="border-t border-navy/10 pt-4">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy">Bu tarihleri takvimde dolu işaretle</button>
                      <p className="mt-1 text-xs text-navy/50">Rezervasyon kesinleşince kullanın; günler sitede seçilemez olur.</p>
                    </form>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
