import { requireAdmin } from "@/lib/admin";
import { CompareAdmin } from "@/components/admin/CompareAdmin";
import type { Curated } from "@/lib/compare";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const { supabase } = await requireAdmin();
  const [{ data, error }, { data: boats }] = await Promise.all([
    supabase.from("site_texts").select("data").eq("key", "comparisons").maybeSingle(),
    supabase.from("boats").select("slug,name").eq("is_published", true).order("name"),
  ]);
  const items: Curated[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
  return (
    <>
      <h1 className="font-display text-3xl">Karşılaştırmalar</h1>
      <p className="mt-1 text-sm text-navy/60">İki yat için kendi yorumunuzu yazın. Sitedeki karşılaştırma sayfasında otomatik değerlendirmenin yanında görünür.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı?</p>}
      <div className="mt-5"><CompareAdmin initial={items} boats={(boats ?? []) as { slug: string; name: string }[]} /></div>
    </>
  );
}
