import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { FAQ_DEFAULT, type FaqItem } from "@/lib/faq";

export const dynamic = "force-dynamic";

export default async function FaqAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_texts").select("data").eq("key", "faq").maybeSingle();
  const items: FaqItem[] = Array.isArray(data?.data?.items) ? data!.data.items : FAQ_DEFAULT;
  return (
    <>
      <p className="text-sm"><Link href="/admin/sayfa-metinleri" className="text-turquoise-dark">← Sayfa Metinleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">Sıkça Sorulan Sorular</h1>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Kayıtlı metinler okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı? Kaydetmeden önce bunu yapın.</p>}
      <div className="mt-5"><FaqEditor initial={items} saved={Boolean(data)} /></div>
    </>
  );
}
