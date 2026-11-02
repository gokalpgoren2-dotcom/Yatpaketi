import { requireAdmin } from "@/lib/admin";
import { ReviewsAdmin, type AdminReview } from "@/components/admin/ReviewsAdmin";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const { supabase } = await requireAdmin();
  const [{ data, error }, { data: boats }] = await Promise.all([
    supabase.from("reviews").select("id,boat_slug,boat_name,author_name,rating,body,photo_path,tour_label,status,source,created_at").order("created_at", { ascending: false }),
    supabase.from("boats").select("slug,name").order("name"),
  ]);
  return (
    <>
      <h1 className="font-display text-3xl">Yorumlar</h1>
      <p className="mt-1 text-sm text-navy/60">Müşterilerden gelen yorumlar önce burada bekler. Onayladığınız yorum yat sayfasında, yatın çıkış limanı sayfasında ve yat kartındaki puanda görünür.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Yorumlar okunamadı ({error.message}). Supabase'e yorumlar SQL kodunu yapıştırdınız mı?</p>}
      <div className="mt-5"><ReviewsAdmin initial={(data ?? []) as AdminReview[]} boats={(boats ?? []) as { slug: string; name: string }[]} /></div>
    </>
  );
}
