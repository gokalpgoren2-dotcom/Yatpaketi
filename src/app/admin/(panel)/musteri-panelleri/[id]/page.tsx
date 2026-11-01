import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PortalAdmin, type PortalRow, type CheckItem } from "@/components/admin/PortalAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function PortalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const cols = "id,email,customer_name,boat_name,tour_start,tour_end,status,location_text,location_updated_at,contract_path,signed_path,signed_at";
  // contract_emailed_at, lat, lng sonradan eklenen sütunlar: SQL henüz çalıştırılmadıysa sayfa yine açılsın.
  const withCol = await supabase.from("customer_portals").select(cols + ",contract_emailed_at,lat,lng,review_open").eq("id", id).maybeSingle();
  const plain = withCol.error ? await supabase.from("customer_portals").select(cols).eq("id", id).maybeSingle() : null;
  const data = (withCol.error ? plain?.data : withCol.data) as Record<string, unknown> | null | undefined;
  if (!data) notFound();
  const { data: items } = await supabase.from("portal_checklist").select("id,label,done,sort_order").eq("portal_id", id).order("sort_order").order("label");
  const store = supabase.storage.from("contracts");
  const sign = async (path: string | null) => (path ? (await store.createSignedUrl(path, 900)).data?.signedUrl ?? null : null);
  const [contractUrl, signedUrl] = await Promise.all([sign(data.contract_path as string | null), sign(data.signed_path as string | null)]);
  return (
    <>
      <p className="text-sm"><Link href="/admin/musteri-panelleri" className="text-turquoise-dark">← Müşteri Panelleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">{String(data.customer_name || data.email)}</h1>
      <div className="mt-5"><PortalAdmin portal={data as unknown as PortalRow} items={(items ?? []) as unknown as CheckItem[]} contractUrl={contractUrl} signedUrl={signedUrl} /></div>
    </>
  );
}
