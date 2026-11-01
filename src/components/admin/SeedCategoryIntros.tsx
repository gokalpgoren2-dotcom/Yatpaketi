"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";

const INTROS: Record<string, string> = {
  gulet: "Gulet, ahşap gövdeli, geniş güverteli klasik mavi yolculuk teknesidir. Genellikle birden fazla kabini vardır ve kaptan ile mürettebatla kiralanır. Kalabalık gruplar ve geleneksel bir mavi yolculuk deneyimi isteyenler için uygundur.",
  motoryat: "Motoryatlar motorla ilerler; kısa sürede daha fazla koy görmeye uygundur. Konfor, hız ve modern iç mekân arayan gruplar için tercih edilir.",
  katamaran: "Katamaranlar iki gövdelidir; dengeli seyreder ve geniş bir ortak yaşam alanı sunar. Aileler ve küçük gruplar için rahat bir seçenektir.",
  yelkenli: "Yelkenli ve katamaranlar rüzgârın gücüyle ilerler. Yelken deneyimi yaşamak isteyenler için uygundur; tekneye göre kaptanlı ya da kaptansız kiralanabilir.",
  trawler: "Trawlerler, yavaş ve ekonomik seyir için tasarlanmış, geniş iç hacimli motorlu teknelerdir. Rahat ve sakin bir tekne tatili isteyenler için uygundur.",
  "luks-yat": "Lüks yatlar, geniş mürettebatı ve üst düzey konforuyla öne çıkar. Kişiye özel rota ve hizmet isteyenler için uygundur.",
  gunluk: "Günübirlik tekneler, tek günlük koy turları, doğum günü ve özel organizasyonlar için kiralanır. Yüzme molaları ve güvertede keyifli bir gün sunar.",
};

// Yalnızca tanıtım metni boş olan tekne tiplerini doldurur.
export function SeedCategoryIntros() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("categories").select("id,slug,intro_tr");
    if (error) { setMsg({ ok: false, text: "Okunamadı: " + error.message + " (Önce Supabase'e kategori SQL kodunu yapıştırın.)" }); setBusy(false); return; }
    let n = 0;
    for (const c of (data ?? []) as { id: string; slug: string; intro_tr: string | null }[]) {
      if (!c.intro_tr && INTROS[c.slug]) {
        const r = await supabase.from("categories").update({ intro_tr: INTROS[c.slug] }).eq("id", c.id);
        if (!r.error) n += 1;
      }
    }
    await refreshSite();
    setMsg({ ok: true, text: n > 0 ? `${n} tekne tipine tanıtım metni eklendi. Metinleri açıp düzenleyebilirsiniz.` : "Doldurulacak boş tanıtım metni yok." });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Örnek tanıtım metinleri</h2>
      <p className="mt-1 text-sm text-navy/60">Tanıtım metni boş olan tekne tiplerine kısa, genel bir açıklama ekler. Eklenen metin hemen sitede görünür; isterseniz sonra düzenleyin.</p>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 rounded-xl p-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="button" onClick={run} disabled={busy} className="mt-4 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Ekleniyor…" : "Boş olanları doldur"}</button>
    </div>
  );
}
