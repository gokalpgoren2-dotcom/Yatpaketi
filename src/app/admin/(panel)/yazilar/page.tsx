import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { SeedPosts } from "@/components/admin/SeedPosts";

export const dynamic = "force-dynamic";

const kinds: Record<string, string> = { destination: "Destinasyonlar (Rehber)", route: "Klasik rotalar (Rehber)", package: "Tur paketleri (Rehber)", process: "Kiralama süreci adımları (Rehber)", guide: "Rehber yazıları", blog: "Blog yazıları", page: "Sabit sayfalar" };

type Row = { id: string; kind: string; slug: string; title_tr: string; status: string };

export default async function Posts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("blog_posts").select("id,kind,slug,title_tr,status").order("kind").order("sort_order").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Yazılar</h1>
        <Link href="/admin/yazilar/yeni" className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white">+ Yeni yazı</Link>
      </div>
      <p className="mt-1 text-sm text-navy/60">Yatpaketi Rehberi, blog ve Hakkımızda gibi sabit sayfalar buradan yönetilir.</p>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Yazılar okunamadı: {error.message}. Supabase'e yazılar SQL kodunu yapıştırdınız mı?</p>}

      {rows.length === 0 && !error && <SeedPosts />}

      {Object.entries(kinds).map(([k, title]) => {
        const list = rows.filter((r) => r.kind === k);
        if (list.length === 0) return null;
        return (
          <section key={k} className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">{title}</h2>
            <ul className="divide-y divide-navy/10 rounded-2xl bg-white shadow-sm">
              {list.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/yazilar/${r.id}`} className="flex items-center justify-between gap-3 p-4">
                    <span className="min-w-0"><span className="block truncate font-medium">{r.title_tr}</span><span className="block truncate text-xs text-navy/50">/{r.slug}</span></span>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${r.status === "published" ? "bg-green-100 text-green-800" : "bg-navy/10 text-navy/70"}`}>{r.status === "published" ? "Yayında" : "Taslak"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
