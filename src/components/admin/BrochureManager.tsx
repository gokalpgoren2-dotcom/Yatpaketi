"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl } from "@/lib/supabase/config";

// Yat tanıtım PDF'i: yüklenince yat sayfasında "Tanıtım dosyasını indir" düğmesi çıkar.
export function BrochureManager({ boatId, slug, initial }: { boatId: string; slug: string; initial: string | null }) {
  const supabase = createClient();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload() {
    const f = ref.current?.files?.[0];
    if (!f) { setMsg({ ok: false, text: "Önce PDF dosyasını seçin." }); return; }
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { setMsg({ ok: false, text: "Yalnızca PDF yükleyebilirsiniz." }); return; }
    if (f.size > 25 * 1024 * 1024) { setMsg({ ok: false, text: "Dosya 25 MB'tan büyük olamaz." }); return; }
    setBusy(true); setMsg(null);
    const p = `brosur/${boatId}/${(slug || "yat").replace(/[^a-z0-9-]/gi, "")}-tanitim-${Date.now()}.pdf`;
    const up = await supabase.storage.from("media").upload(p, f, { contentType: "application/pdf", cacheControl: "3600" });
    if (up.error) { setBusy(false); setMsg({ ok: false, text: up.error.message.includes("mime") ? "PDF yüklenemedi. Önce Supabase'de yat-brosur.sql dosyasını çalıştırın." : "Yüklenemedi: " + up.error.message }); return; }
    const { error } = await supabase.from("boats").update({ brochure_path: p }).eq("id", boatId);
    if (error) { setBusy(false); setMsg({ ok: false, text: error.message.includes("brochure_path") ? "Önce Supabase'de yat-brosur.sql dosyasını çalıştırın." : "Kaydedilemedi: " + error.message }); return; }
    if (path && !path.startsWith("/")) await supabase.storage.from("media").remove([path]);
    setPath(p); setBusy(false); if (ref.current) ref.current.value = "";
    setMsg({ ok: true, text: "Tanıtım PDF'i yüklendi. Yat sayfasında indirilebilir." });
    router.refresh();
  }

  async function remove() {
    if (!path || !confirm("Tanıtım PDF'i silinsin mi?")) return;
    setBusy(true);
    if (!path.startsWith("/")) await supabase.storage.from("media").remove([path]);
    const { error } = await supabase.from("boats").update({ brochure_path: null }).eq("id", boatId);
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Silinemedi: " + error.message }); return; }
    setPath(null); setMsg({ ok: true, text: "Silindi." });
    router.refresh();
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Yat tanıtım dosyası (PDF)</h2>
      <p className="text-sm text-navy/60">Yüklediğiniz PDF yat sayfasında &quot;Tanıtım dosyasını indir&quot; düğmesiyle misafirlere sunulur. En çok 25 MB.</p>
      {path && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-mist p-3 text-sm">
          <span className="font-semibold text-navy">{path.startsWith("/brosur/") ? "Otomatik oluşturulan PDF (yat bilgileri değişince kendiliğinden güncellenir)" : "Yüklü PDF var"}</span>
          <a href={publicImageUrl(path) ?? "#"} target="_blank" rel="noopener" className="font-semibold text-turquoise-dark">Aç</a>
          <button type="button" onClick={remove} disabled={busy} className="ml-auto text-sm font-semibold text-red-600">Sil</button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={ref} type="file" accept="application/pdf,.pdf" className="text-sm" />
        <button type="button" onClick={upload} disabled={busy} className="rounded-xl bg-turquoise px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Yükleniyor…" : path ? "Yeni PDF yükle" : "PDF yükle"}</button>
      </div>
      {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
    </section>
  );
}
