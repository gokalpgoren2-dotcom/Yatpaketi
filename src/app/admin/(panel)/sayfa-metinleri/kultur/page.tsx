import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { CultureEditor } from "@/components/admin/CultureEditor";
import { CULTURE } from "@/lib/culture";
import { CULTURE_FIELDS } from "@/lib/text-fields";

export const dynamic = "force-dynamic";

export default async function CultureAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_texts").select("data").eq("key", "culture").maybeSingle();
  const d = data?.data;
  const initial = d ? { tr: { ...CULTURE.tr, ...(d.tr ?? {}) }, en: { ...CULTURE.en, ...(d.en ?? {}) } } : CULTURE;
  return (
    <>
      <p className="text-sm"><Link href="/admin/sayfa-metinleri" className="text-turquoise-dark">← Sayfa Metinleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">Yat ve Yatçılık Kültürü</h1>
      <p className="mt-1 text-sm text-navy/60">Sayfanın kapak fotoğrafı için Yazılar bölümündeki "Yat ve Yatçılık Kültürü" sabit sayfasına kapak fotoğrafı yükleyin.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Kayıtlı metinler okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı? Kaydetmeden önce bunu yapın.</p>}
      <div className="mt-5"><CultureEditor initial={initial} saved={Boolean(d)} storeKey="culture" fields={CULTURE_FIELDS} defaults={CULTURE} /></div>
    </>
  );
}
