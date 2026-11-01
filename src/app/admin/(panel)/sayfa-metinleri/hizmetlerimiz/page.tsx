import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { CultureEditor } from "@/components/admin/CultureEditor";
import { SERVICES } from "@/lib/services";
import { SERVICES_FIELDS } from "@/lib/text-fields";

export const dynamic = "force-dynamic";

export default async function ServicesAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_texts").select("data").eq("key", "services").maybeSingle();
  const d = data?.data;
  const initial = d ? { tr: { ...SERVICES.tr, ...(d.tr ?? {}) }, en: { ...SERVICES.en, ...(d.en ?? {}) } } : SERVICES;
  return (
    <>
      <p className="text-sm"><Link href="/admin/sayfa-metinleri" className="text-turquoise-dark">← Sayfa Metinleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">Hizmetlerimiz</h1>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">Kayıtlı metinler okunamadı ({error.message}). Supabase'e sayfa-metinleri SQL kodunu yapıştırdınız mı? Kaydetmeden önce bunu yapın.</p>}
      <div className="mt-5"><CultureEditor initial={initial} saved={Boolean(d)} storeKey="services" fields={SERVICES_FIELDS} defaults={SERVICES} /></div>
    </>
  );
}
