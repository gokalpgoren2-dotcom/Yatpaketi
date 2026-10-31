import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { publicImageUrl } from "@/lib/supabase/config";
import { setFeatured, setPublished } from "./actions";

export const dynamic = "force-dynamic";

type Row = {
  id: string; name: string; slug: string; is_published: boolean; is_featured: boolean; sort_order: number;
  category: { name_tr: string } | null;
  boat_images: { path: string; is_cover: boolean; sort_order: number }[];
};

export default async function BoatsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("boats")
    .select("id,name,slug,is_published,is_featured,sort_order,category:categories(name_tr),boat_images(path,is_cover,sort_order)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Tekneler</h1>
        <Link href="/admin/tekneler/yeni" className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white">Yeni tekne</Link>
      </div>
      {deleted && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-green-800">Tekne silindi.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">Liste alınamadı: {error.message}. SQL şemasını çalıştırdınız mı?</p>}
      {!error && rows.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-navy/70">Henüz tekne yok. “Yeni tekne” ile ilk tekneyi ekleyin.</p>
      )}
      <ul className="mt-5 space-y-3">
        {rows.map((b) => {
          const imgs = [...b.boat_images].sort((a, c) => a.sort_order - c.sort_order);
          const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
          const url = publicImageUrl(cover?.path);
          return (
            <li key={b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-mist">
                {url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.name}</p>
                <p className="text-sm text-navy/60">{b.category?.name_tr ?? "Kategori yok"} · sıra {b.sort_order}</p>
                <p className="mt-1 text-xs">
                  <span className={`rounded-full px-2.5 py-1 ${b.is_published ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/70"}`}>{b.is_published ? "Yayında" : "Taslak"}</span>
                  {b.is_featured && <span className="ml-2 rounded-full bg-turquoise/15 px-2.5 py-1 text-turquoise-dark">Öne çıkan</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/tekneler/${b.id}`} className="rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white">Düzenle</Link>
                <form action={setPublished}>
                  <input type="hidden" name="id" value={b.id} /><input type="hidden" name="value" value={String(!b.is_published)} />
                  <button className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-medium">{b.is_published ? "Yayından kaldır" : "Yayınla"}</button>
                </form>
                <form action={setFeatured}>
                  <input type="hidden" name="id" value={b.id} /><input type="hidden" name="value" value={String(!b.is_featured)} />
                  <button className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-medium">{b.is_featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}</button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
