import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BoatForm } from "@/components/admin/BoatForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { deleteBoat } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBoat({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const [boat, cats, dests, links, imgs] = await Promise.all([
    supabase.from("boats").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name_tr").order("sort_order"),
    supabase.from("destinations").select("id,name_tr").order("sort_order"),
    supabase.from("boat_destinations").select("destination_id").eq("boat_id", id),
    supabase.from("boat_images").select("id,path,is_cover,sort_order").eq("boat_id", id).order("sort_order"),
  ]);
  if (!boat.data) notFound();

  return (
    <>
      <p className="text-sm"><Link href="/admin/tekneler" className="text-turquoise-dark">← Tekneler</Link></p>
      <h1 className="font-display mt-2 text-3xl">{boat.data.name}</h1>
      {saved && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-green-800">Kaydedildi.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">{error}</p>}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Fotoğraflar</h2>
        <PhotoManager boatId={id} initial={(imgs.data ?? []) as { id: string; path: string; is_cover: boolean; sort_order: number }[]} />
      </section>

      <div className="mt-6">
        <BoatForm
          boat={boat.data}
          categories={(cats.data ?? []).map((c: any) => ({ id: c.id, label: c.name_tr }))}
          destinations={(dests.data ?? []).map((d: any) => ({ id: d.id, label: d.name_tr }))}
          selected={(links.data ?? []).map((l: any) => l.destination_id)}
        />
      </div>

      <details className="mt-10 rounded-2xl border border-red-200 bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold text-red-700">Tekneyi sil</summary>
        <p className="mt-3 text-sm text-navy/70">Bu işlem tekneyi ve tüm fotoğraflarını kalıcı olarak siler. Geri alınamaz. Sadece sitede göstermek istemiyorsanız, “Sitede yayınla” seçeneğini kapatın.</p>
        <form action={deleteBoat} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <button className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white">Evet, kalıcı olarak sil</button>
        </form>
      </details>
    </>
  );
}
