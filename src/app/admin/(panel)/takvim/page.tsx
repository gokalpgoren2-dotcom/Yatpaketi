import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function CalendarIndex() {
  const { supabase } = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const [boats, blocks] = await Promise.all([
    supabase.from("boats").select("id,name,is_published").order("name"),
    supabase.from("availability_blocks").select("boat_id").gte("end_date", today),
  ]);
  const count = new Map<string, number>();
  (blocks.data ?? []).forEach((b: { boat_id: string }) => count.set(b.boat_id, (count.get(b.boat_id) ?? 0) + 1));
  const rows = (boats.data ?? []) as { id: string; name: string; is_published: boolean }[];

  return (
    <>
      <h1 className="font-display text-3xl">Müsaitlik takvimi</h1>
      <p className="mt-1 text-sm text-navy/60">Bir tekne seçin, dolu veya kapalı günleri işaretleyin. İşaretli günler sitede seçilemez.</p>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60">Henüz tekne yok. Önce Tekneler bölümünden bir tekne ekleyin.</p>
      ) : (
        <ul className="mt-5 divide-y divide-navy/10 rounded-2xl bg-white shadow-sm">
          {rows.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/takvim/${b.id}`} className="flex items-center justify-between gap-3 p-4">
                <span className="min-w-0">
                  <span className="block font-semibold">{b.name}</span>
                  <span className="block text-xs text-navy/50">{b.is_published ? "Yayında" : "Yayında değil"}</span>
                </span>
                <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-navy">{count.get(b.id) ?? 0} kayıt →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
