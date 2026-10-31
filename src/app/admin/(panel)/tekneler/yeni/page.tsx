import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { BoatForm } from "@/components/admin/BoatForm";

export const dynamic = "force-dynamic";

export default async function NewBoat({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [cats, dests] = await Promise.all([
    supabase.from("categories").select("id,name_tr").order("sort_order"),
    supabase.from("destinations").select("id,name_tr").order("sort_order"),
  ]);
  return (
    <>
      <p className="text-sm"><Link href="/admin/tekneler" className="text-turquoise-dark">← Tekneler</Link></p>
      <h1 className="font-display mt-2 text-3xl">Yeni tekne</h1>
      <p className="mt-1 text-sm text-navy/60">Önce bilgileri kaydedin, fotoğrafları kayıttan sonra ekleyebilirsiniz.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-5">
        <BoatForm
          boat={null}
          categories={(cats.data ?? []).map((c: any) => ({ id: c.id, label: c.name_tr }))}
          destinations={(dests.data ?? []).map((d: any) => ({ id: d.id, label: d.name_tr }))}
          selected={[]}
        />
      </div>
    </>
  );
}
