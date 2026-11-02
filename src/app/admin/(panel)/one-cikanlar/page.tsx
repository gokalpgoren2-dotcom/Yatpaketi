import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { moveFeatured } from "./actions";

export const dynamic = "force-dynamic";

export default async function FeaturedAdmin() {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase.from("boats").select("slug,name").eq("is_featured", true).eq("is_published", true).order("sort_order").order("name");
  const { data: saved } = await supabase.from("site_texts").select("data").eq("key", "featured").maybeSingle();
  const pref: string[] = Array.isArray(saved?.data?.order) ? saved!.data.order : [];
  const list = (rows ?? []) as { slug: string; name: string }[];
  const rank = (s: string) => { const i = pref.indexOf(s); return i < 0 ? 9999 : i; };
  const sorted = [...list].sort((a, b) => rank(a.slug) - rank(b.slug));
  const order = sorted.map((b) => b.slug).join(",");
  const btn = "rounded-lg border border-navy/15 px-3 py-2 text-xs font-medium hover:border-turquoise";
  return (
    <>
      <h1 className="font-display text-3xl">Öne çıkanların sırası</h1>
      <p className="mt-1 text-sm text-navy/60">Ana sayfada soldan sağa bu sırayla görünür. Yat eklemek için Yatlar listesinde "Öne çıkar"a basın. <Link href="/admin/tekneler" className="text-turquoise-dark">Yatlar →</Link></p>
      {sorted.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-6 text-sm text-navy/70">Henüz öne çıkarılmış yayında yat yok.</p>
      ) : (
        <ol className="mt-5 space-y-3">
          {sorted.map((b, i) => (
            <li key={b.slug} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-medium"><span className="mr-2 text-navy/40">{i + 1}.</span>{b.name}</p>
              <form action={moveFeatured} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="order" value={order} /><input type="hidden" name="slug" value={b.slug} />
                <button name="to" value="first" className={btn}>En başa</button>
                <button name="to" value="up" className={btn}>← Öne</button>
                <button name="to" value="middle" className={btn}>Ortaya</button>
                <button name="to" value="down" className={btn}>Arkaya →</button>
                <button name="to" value="last" className={btn}>En sona</button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
