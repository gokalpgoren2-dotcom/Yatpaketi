import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BlockManager } from "@/components/admin/BlockManager";

export const dynamic = "force-dynamic";

export default async function BoatCalendar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [boat, blocks] = await Promise.all([
    supabase.from("boats").select("id,name").eq("id", id).maybeSingle(),
    supabase.from("availability_blocks").select("id,start_date,end_date,kind,note").eq("boat_id", id).order("start_date"),
  ]);
  if (!boat.data) notFound();
  return (
    <>
      <p className="text-sm"><Link href="/admin/takvim" className="text-turquoise-dark">← Takvim</Link></p>
      <h1 className="font-display mt-2 text-3xl">{boat.data.name}</h1>
      <p className="mt-1 text-sm text-navy/60">Giriş ve çıkış günü dahil, seçilen tüm günler dolu sayılır.</p>
      <div className="mt-6">
        <BlockManager boatId={id} initial={(blocks.data ?? []) as { id: string; start_date: string; end_date: string; kind: string; note: string | null }[]} />
      </div>
    </>
  );
}
