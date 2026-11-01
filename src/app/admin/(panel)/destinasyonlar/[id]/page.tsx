import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { EntityForm, type EntityRow } from "@/components/admin/EntityForm";

export const dynamic = "force-dynamic";

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  let row: EntityRow | null = null;
  if (id !== "yeni") {
    const { data } = await supabase.from("destinations").select("id,slug,name_tr,blurb_tr,intro_tr,cover_path,seo_title,seo_description,sort_order,is_published,is_featured").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data as unknown as EntityRow;
  }
  return (
    <>
      <p className="text-sm"><Link href="/admin/destinasyonlar" className="text-turquoise-dark">← Destinasyonlar</Link></p>
      <h1 className="font-display mt-2 text-3xl">{row ? row.name_tr : "Yeni"}</h1>
      <div className="mt-5"><EntityForm table="destinations" row={row} /></div>
    </>
  );
}
