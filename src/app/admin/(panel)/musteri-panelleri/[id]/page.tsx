import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PortalAdmin, type PortalRow, type CheckItem } from "@/components/admin/PortalAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function PortalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("customer_portals").select("id,email,customer_name,boat_name,tour_start,tour_end,status,location_text,location_updated_at,contract_path,signed_path,signed_at").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { data: items } = await supabase.from("portal_checklist").select("id,label,done,sort_order").eq("portal_id", id).order("sort_order").order("label");
  return (
    <>
      <p className="text-sm"><Link href="/admin/musteri-panelleri" className="text-turquoise-dark">← Müşteri Panelleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">{data.customer_name || data.email}</h1>
      <div className="mt-5"><PortalAdmin portal={data as unknown as PortalRow} items={(items ?? []) as unknown as CheckItem[]} /></div>
    </>
  );
}
