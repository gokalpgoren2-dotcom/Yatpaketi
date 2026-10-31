import { requireAdmin } from "@/lib/admin";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const { supabase } = await requireAdmin();
  const [home, dests] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "home").maybeSingle(),
    supabase.from("destinations").select("id,name_tr,cover_path").order("sort_order"),
  ]);
  const v = (home.data?.value ?? {}) as { hero_path?: string; title?: string; subtitle?: string };
  return (
    <>
      <h1 className="font-display text-3xl">Site içeriği</h1>
      <p className="mt-1 text-sm text-navy/60">Ana sayfanın büyük fotoğrafını, başlığını ve destinasyon fotoğraflarını buradan değiştirin. Değişiklik bir dakika içinde sitede görünür.</p>
      <div className="mt-6">
        <SiteContentEditor
          initial={{ hero_path: v.hero_path ?? "", title: v.title ?? "", subtitle: v.subtitle ?? "" }}
          destinations={(dests.data ?? []).map((d: any) => ({ id: d.id, name: d.name_tr, cover_path: d.cover_path ?? "" }))}
        />
      </div>
    </>
  );
}
