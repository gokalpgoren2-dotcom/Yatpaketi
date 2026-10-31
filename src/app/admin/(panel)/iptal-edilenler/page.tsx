import { requireAdmin } from "@/lib/admin";
import { Notice } from "@/components/admin/FormBits";
import { reopenRequest } from "../rezervasyonlar/actions";

export const dynamic = "force-dynamic";

type Req = {
  id: string; boat_name: string | null; customer_name: string; phone: string | null; email: string | null;
  start_date: string | null; end_date: string | null; guests: number | null; message: string | null;
  admin_notes: string | null; cancel_reason: string | null; cancelled_at: string | null; cancel_files: string[] | null; created_at: string;
};

const fmt = (d: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "—");
const fmtTime = (d: string | null) => (d ? new Date(d).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—");

// İptal edilen rezervasyon talepleri: kayıt amaçlı arşiv. Silme düğmesi bilerek yok.
export default async function Cancelled({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; t?: string }> }) {
  const { error, saved, t } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error: readError } = await supabase.from("reservation_requests").select("*").eq("status", "cancelled").order("created_at", { ascending: false }).limit(500);
  const rows = (data ?? []) as Req[];
  const store = supabase.storage.from("contracts");
  const links: Record<string, { name: string; url: string }[]> = {};
  for (const r of rows) {
    const out: { name: string; url: string }[] = [];
    for (const [i, path] of (r.cancel_files ?? []).entries()) {
      const { data: signed } = await store.createSignedUrl(path, 900);
      if (signed?.signedUrl) out.push({ name: `Dosya ${i + 1}${path.endsWith(".pdf") ? " (PDF)" : " (fotoğraf)"}`, url: signed.signedUrl });
    }
    links[r.id] = out;
  }
  return (
    <>
      <h1 className="font-display text-3xl">İptal edilen rezervasyonlar</h1>
      <p className="mt-1 text-sm text-navy/60">Kayıt ve olası hukuki ihtiyaçlar için saklanır. Bu sayfadan silinemez.</p>
      {saved && <Notice key={"s" + t} kind="ok" text="Talep yeniden aktif listeye alındı." />}
      {(error || readError) && <Notice key={"e" + t} kind="error" text={error ?? "Okunamadı: " + readError?.message} />}
      {rows.length === 0 && !readError && <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60 shadow-sm">İptal edilen rezervasyon yok.</p>}
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white shadow-sm">
            <details>
              <summary className="cursor-pointer list-none p-4">
                <span className="block font-semibold">{r.customer_name}</span>
                <span className="block text-sm text-navy/60">{r.boat_name ?? "Tekne belirtilmedi"} · {fmt(r.start_date)} – {fmt(r.end_date)}</span>
                <span className="mt-1 block text-sm text-red-700">İptal sebebi: {r.cancel_reason || "Yazılmamış"}</span>
              </summary>
              <div className="space-y-4 border-t border-navy/10 p-4 text-sm">
                <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  <div><dt className="text-navy/50">Telefon</dt><dd>{r.phone ?? "—"}</dd></div>
                  <div><dt className="text-navy/50">E-posta</dt><dd className="break-all">{r.email ?? "—"}</dd></div>
                  <div><dt className="text-navy/50">Misafir</dt><dd>{r.guests ?? "—"}</dd></div>
                  <div><dt className="text-navy/50">Talep tarihi</dt><dd>{fmtTime(r.created_at)}</dd></div>
                  <div><dt className="text-navy/50">İptal tarihi</dt><dd>{fmtTime(r.cancelled_at)}</dd></div>
                </dl>
                {r.message && <div><p className="text-navy/50">Müşterinin mesajı</p><p className="mt-1 whitespace-pre-line rounded-xl bg-mist p-3">{r.message}</p></div>}
                {r.admin_notes && <div><p className="text-navy/50">Notunuz</p><p className="mt-1 whitespace-pre-line rounded-xl bg-mist p-3">{r.admin_notes}</p></div>}
                {links[r.id]?.length > 0 && (
                  <div>
                    <p className="text-navy/50">İptal kanıtı dosyaları</p>
                    <p className="mt-1 flex flex-wrap gap-2">
                      {links[r.id].map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener" className="rounded-xl border border-navy/15 px-3 py-2 text-sm font-semibold text-turquoise-dark">{l.name}</a>)}
                    </p>
                  </div>
                )}
                <form action={reopenRequest}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold">Yeniden aktif talebe al</button>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
