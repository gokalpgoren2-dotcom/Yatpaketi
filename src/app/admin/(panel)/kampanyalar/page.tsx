import { requireAdmin } from "@/lib/admin";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import type { Campaign } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function CampaignsAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_texts").select("data").eq("key", "campaigns").maybeSingle();
  const items: Campaign[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
  return (
    <>
      <h1 className="font-display text-3xl">Kampanyalar</h1>
      <p className="mt-1 text-sm text-navy/60">Erken rezervasyon ve indirim kartları. Ana sayfada görünür.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Kayıtlı kampanyalar okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı?</p>}
      <div className="mt-5"><CampaignEditor initial={items} /></div>
    </>
  );
}
