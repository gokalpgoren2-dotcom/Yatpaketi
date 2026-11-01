import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PostForm, type PostRow } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("blog_posts").select("id,kind,slug,title_tr,excerpt_tr,content_tr,title_en,excerpt_en,content_en,cover_path,seo_title,seo_description,status,sort_order,published_at").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { data: pp } = await supabase.from("site_texts").select("data").eq("key", "dest_photos").maybeSingle();
  const gl = (pp?.data as Record<string, string[]> | undefined)?.[data.slug as string];
  const gallery = Array.isArray(gl) ? gl : [];
  return (
    <>
      <p className="text-sm"><Link href="/admin/yazilar" className="text-turquoise-dark">← Yazılar</Link></p>
      <h1 className="font-display mt-2 text-3xl">{data.title_tr}</h1>
      {saved && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800 ring-1 ring-green-200">Kaydedildi.</p>}
      <div className="mt-5"><PostForm post={data as PostRow} gallery={gallery} /></div>
    </>
  );
}
