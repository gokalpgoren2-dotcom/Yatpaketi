import { requireAdmin } from "@/lib/admin";
import { MenusAdmin, type AdminMenu } from "@/components/admin/MenusAdmin";

export const dynamic = "force-dynamic";

export default async function MenusPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("portal_menus").select("id,title,description,file_path,sort_order,active").order("sort_order").order("title");
  const store = supabase.storage.from("portal-files");
  const menus: AdminMenu[] = await Promise.all(((data ?? []) as Omit<AdminMenu, "url">[]).map(async (m) => ({ ...m, url: m.file_path ? (await store.createSignedUrl(m.file_path, 900)).data?.signedUrl ?? null : null })));
  return (
    <>
      <h1 className="font-display text-3xl">Menüler</h1>
      <p className="mt-1 text-sm text-navy/60">Buraya eklediğiniz menüler müşterilerin Turum sayfasında görünür; misafir beğendiklerini seçer. Seçimleri her müşterinin panel sayfasında görürsünüz.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Menüler okunamadı. Supabase&apos;de <b>supabase/turum-misafir.sql</b> dosyasını bir kez çalıştırın.</p>}
      {!error && <div className="mt-5"><MenusAdmin initial={menus} /></div>}
    </>
  );
}
