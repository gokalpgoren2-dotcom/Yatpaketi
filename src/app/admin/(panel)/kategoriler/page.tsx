import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { SeedCategoryIntros } from "@/components/admin/SeedCategoryIntros";

export const dynamic = "force-dynamic";

type Row = { id: string; name_tr: string; slug: string; flag: boolean | null };

export default async function List() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("categories").select("id,name_tr,slug,is_active").order("sort_order");
  const rows = ((data ?? []) as Record<string, any>[]).map((r) => ({ id: r.id, name_tr: r.name_tr, slug: r.slug, flag: r.is_active })) as Row[];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Yat tipleri</h1>
        <Link href="/admin/kategoriler/yeni" className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white">+ Yeni</Link>
      </div>
      <p className="mt-1 text-sm text-navy/60">Gulet, motoryat gibi tipler. Her tipin sitede kendi sayfası vardır.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Okunamadı: {error.message}</p>}
      <SeedCategoryIntros />
      <ul className="mt-5 divide-y divide-navy/10 rounded-2xl bg-white shadow-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/kategoriler/${r.id}`} className="flex items-center justify-between gap-3 p-4">
              <span className="min-w-0"><span className="block truncate font-medium">{r.name_tr}</span><span className="block truncate text-xs text-navy/50">/{r.slug}</span></span>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${r.flag ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/70"}`}>{r.flag ? "Görünür" : "Kapalı"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
