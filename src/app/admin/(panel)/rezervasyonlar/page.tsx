import { requireAdmin } from "@/lib/admin";
import { Notice, SubmitButton } from "@/components/admin/FormBits";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { updateRequest, deleteRequest } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { new: "Yeni", contacted: "İletişim kuruldu", offered: "Teklif verildi", confirmed: "Onaylandı", cancelled: "İptal" };
const tone: Record<string, string> = {
  new: "bg-turquoise text-white", contacted: "bg-navy/10 text-navy", offered: "bg-amber-100 text-amber-900", confirmed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-700",
};

type Req = {
  id: string; boat_name: string | null; customer_name: string; phone: string | null; email: string | null;
  start_date: string | null; end_date: string | null; guests: number | null; message: string | null;
  status: string; admin_notes: string | null; cancel_reason?: string | null; created_at: string;
};

const fmt = (d: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "—");

export default async function Requests({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; t?: string; durum?: string }> }) {
  const { error, saved, t, durum } = await searchParams;
  const { supabase } = await requireAdmin();
  let q = supabase.from("reservation_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (durum && labels[durum] && durum !== "cancelled") q = q.eq("status", durum);
  else q = q.neq("status", "cancelled"); // iptal edilenler ayrı sayfada ("İptal Edilenler") saklanır
  const { data } = await q;
  const rows = (data ?? []) as Req[];

  return (
    <>
      <h1 className="font-display text-3xl">Rezervasyon talepleri</h1>
      <p className="mt-1 text-sm text-navy/60">Bunlar kesin rezervasyon değil, ziyaretçilerin gönderdiği taleplerdir. Müsaitliği ve fiyatı teyit ettikten sonra durumu güncelleyin.</p>
      {saved && <Notice key={"s" + t} kind="ok" text="Kaydedildi." />}
      {error && <Notice key={"e" + t} kind="error" text={error} />}

      <p className="mt-2 text-sm"><a href="/admin/iptal-edilenler" className="font-medium text-turquoise-dark">İptal edilen rezervasyonlar (arşiv) →</a></p>

      <nav aria-label="Duruma göre filtre" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {[["", "Aktif talepler"], ...Object.entries(labels).filter(([k]) => k !== "cancelled")].map(([k, v]) => (
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
                    {r.status === "cancelled" && r.cancel_reason && <span className="mt-1 block text-sm text-red-700">İptal sebebi: {r.cancel_reason}</span>}
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
                  {r.email && (
                    <a
                      href={`/admin/musteri-panelleri/yeni?${new URLSearchParams({ email: r.email, ad: r.customer_name, tekne: r.boat_name ?? "", bas: r.start_date ?? "", bit: r.end_date ?? "" }).toString()}`}
                      className="inline-block rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Bu talep için müşteri paneli aç
                    </a>
                  )}
                  <form action={updateRequest} className="space-y-3">
                    <input type="hidden" name="id" value={r.id} />
                    <div>
                      <label htmlFor={`st-${r.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Durum</label>
                      <select id={`st-${r.id}`} name="status" defaultValue={r.status} className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base">
                        {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`cr-${r.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">İptal sebebi (durum "İptal" ise zorunlu)</label>
                      <textarea id={`cr-${r.id}`} name="cancel_reason" rows={2} maxLength={1000} defaultValue={r.cancel_reason ?? ""} placeholder="Örn. Müşteri tarih değiştirdi, tekne müsait değil, fiyatta anlaşılamadı" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base" />
                    </div>
                    <div>
                      <label htmlFor={`nt-${r.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Not (yalnızca siz görürsünüz)</label>
                      <textarea id={`nt-${r.id}`} name="admin_notes" rows={2} maxLength={2000} defaultValue={r.admin_notes ?? ""} className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base" />
                    </div>
                    <SubmitButton>Kaydet</SubmitButton>
                  </form>
                  <ConfirmDelete action={deleteRequest} id={r.id} label="Talebi sil" warning="Bu talep kalıcı olarak silinir, geri getirilemez." />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
