import { requireAdmin } from "@/lib/admin";
import { CampaignEditor } from "@/components/admin/CampaignEditor";
import type { Campaign } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function CampaignsAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_texts").select("data").eq("key", "campaigns").maybeSingle();
  const { data: boatRows } = await supabase.from("boats").select("slug,name").eq("is_published", true).order("sort_order").order("name");
  const boats = (boatRows ?? []).map((b) => ({ slug: b.slug as string, name: b.name as string }));
  const raw: Campaign[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
  const items = raw.filter((c) => c && c.kind); // eski biçimdeki kayıtlar atlanır
  return (
    <>
      <h1 className="font-display text-3xl">Kampanyalar</h1>
      <p className="mt-1 text-sm text-navy/60">Erken rezervasyon ve indirim kartları: türü, yüzdeyi ve tekneleri seçin. Ana sayfada görünür.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Kayıtlı kampanyalar okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı?</p>}
      <div className="mt-5"><CampaignEditor initial={items} boats={boats} /></div>
    </>
  );
}
