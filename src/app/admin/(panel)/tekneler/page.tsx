import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { publicImageUrl } from "@/lib/supabase/config";
import { setFeatured, setPublished, bulkSetPublished } from "./actions";
import SelectAll from "@/components/admin/SelectAll";

const PER_PAGE = 30;

export const dynamic = "force-dynamic";

type Row = {
  id: string; name: string; slug: string; is_published: boolean; is_featured: boolean; sort_order: number;
  category: { name_tr: string } | null;
  boat_images: { path: string; is_cover: boolean; sort_order: number }[];
};

export default async function BoatsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string; q?: string; durum?: string; kat?: string; sayfa?: string; bulk?: string; n?: string }> }) {
  const { deleted, q: qRaw, durum, kat, sayfa, bulk, n } = await searchParams;
  const q = (qRaw ?? "").trim().slice(0, 60).replace(/[%,()*]/g, " ").trim();
  const page = Math.max(1, Number(sayfa) || 1);
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("categories").select("id,name_tr").order("name_tr");
  let query = supabase
    .from("boats")
    .select("id,name,slug,is_published,is_featured,sort_order,category:categories(name_tr),boat_images(path,is_cover,sort_order)", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (q) query = query.ilike("name", `%${q}%`);
  if (durum === "taslak") query = query.eq("is_published", false);
  if (durum === "yayinda") query = query.eq("is_published", true);
  if (kat) query = query.eq("category_id", kat);
  const { data, error, count } = await query;
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (durum) u.set("durum", durum);
    if (kat) u.set("kat", kat);
    if (p > 1) u.set("sayfa", String(p));
    const s2 = u.toString();
    return `/admin/tekneler${s2 ? `?${s2}` : ""}`;
  };
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Tekneler</h1>
        <Link href="/admin/tekneler/yeni" className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white">Yeni tekne</Link>
      </div>
      {bulk === "pub" && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-green-800">{n} tekne yayına alındı.</p>}
      {bulk === "unpub" && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-green-800">{n} tekne yayından kaldırıldı.</p>}
      {bulk === "none" && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">Önce listeden tekne seçin.</p>}
      {bulk === "err" && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">İşlem yapılamadı.</p>}
      <form method="get" className="mt-4 flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <input name="q" defaultValue={q} placeholder="Tekne adı ara" className="min-w-0 flex-1 rounded-lg border border-navy/15 px-3 py-2.5 text-sm" />
        <select name="durum" defaultValue={durum ?? ""} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm">
          <option value="">Hepsi</option><option value="taslak">Taslak</option><option value="yayinda">Yayında</option>
        </select>
        <select name="kat" defaultValue={kat ?? ""} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm">
          <option value="">Tüm kategoriler</option>
          {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name_tr}</option>)}
        </select>
        <button className="rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white">Filtrele</button>
      </form>
      <p className="mt-3 text-sm text-navy/70">{total} tekne · sayfa {page}/{pages}</p>
      {deleted && <p role="status" className="mt-4 rounded-xl bg-white p-4 text-sm text-green-800">Tekne silindi.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">Liste alınamadı: {error.message}. SQL şemasını çalıştırdınız mı?</p>}
      {!error && rows.length === 0 && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-navy/70">Henüz tekne yok. “Yeni tekne” ile ilk tekneyi ekleyin.</p>
      )}
      <form id="bulkform" action={bulkSetPublished}>
      <input type="hidden" name="back" value={qs(page)} />
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
        <SelectAll formId="bulkform" />
        <button name="value" value="true" className="rounded-lg bg-turquoise px-4 py-2.5 text-sm font-semibold text-white">Seçilenleri yayınla</button>
        <button name="value" value="false" className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-medium">Seçilenleri yayından kaldır</button>
      </div>
      </form>
      <ul className="mt-3 space-y-3">
        {rows.map((b) => {
          const imgs = [...b.boat_images].sort((a, c) => a.sort_order - c.sort_order);
          const cover = imgs.find((i) => i.is_cover) ?? imgs[0];
          const url = publicImageUrl(cover?.path);
          return (
            <li key={b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <input type="checkbox" name="ids" form="bulkform" value={b.id} aria-label={`${b.name} seç`} className="h-5 w-5 shrink-0" />
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-mist">
                {url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.name}</p>
                <p className="text-sm text-navy/60">{b.category?.name_tr ?? "Kategori yok"} · sıra {b.sort_order}</p>
                <p className="mt-1 text-xs">
                  <span className={`rounded-full px-2.5 py-1 ${b.is_published ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/70"}`}>{b.is_published ? "Yayında" : "Taslak"}</span>
                  {b.is_featured && <span className="ml-2 rounded-full bg-turquoise/15 px-2.5 py-1 text-turquoise-dark">Öne çıkan</span>}
                  {imgs.length === 0 && <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">Fotoğraf yok</span>}
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
      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? <Link href={qs(page - 1)} className="rounded-lg bg-white px-4 py-2.5 font-medium shadow-sm">← Önceki</Link> : <span />}
          <span className="text-navy/70">{page} / {pages}</span>
          {page < pages ? <Link href={qs(page + 1)} className="rounded-lg bg-white px-4 py-2.5 font-medium shadow-sm">Sonraki →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
