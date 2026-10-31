"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { shrink } from "@/lib/shrink";

// Rezervasyonu iptal eder: sebep zorunlu, kanıt dosyaları (yazışma ekran görüntüsü, PDF) özel depoya yüklenir.
export function CancelPanel({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > 20 * 1024 * 1024) { setErr(`${f.name} çok büyük (en çok 20 MB).`); continue; }
      next.push(f);
    }
    setFiles(next.slice(0, 10));
    if (input.current) input.current.value = "";
  }

  async function submit() {
    setErr("");
    if (!reason.trim()) { setErr("İptal sebebini yazın."); return; }
    setBusy(true);
    const paths: string[] = [];
    try {
      for (const f of files) {
        const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        const body: Blob = isPdf ? f : await shrink(f); // fotoğraflar JPEG'e çevrilir (iPhone HEIC dahil)
        const path = `cancel/${id}/${crypto.randomUUID()}.${isPdf ? "pdf" : "jpg"}`;
        const up = await supabase.storage.from("contracts").upload(path, body, { contentType: isPdf ? "application/pdf" : "image/jpeg" });
        if (up.error) throw new Error("Dosya yüklenemedi: " + up.error.message);
        paths.push(path);
      }
      const { error } = await supabase.from("reservation_requests").update({
        status: "cancelled", cancel_reason: reason.trim(), cancelled_at: new Date().toISOString(), cancel_files: paths,
      }).eq("id", id);
      if (error) throw new Error(error.message + (error.message.includes("cancel") ? " (Supabase'e iptal SQL kodunu yapıştırdınız mı?)" : ""));
      router.push("/admin/iptal-edilenler");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "İptal edilemedi.");
      setBusy(false);
    }
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">Rezervasyonu iptal et</button>;
  }

  return (
    <div className="space-y-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
      <p className="text-sm font-semibold text-red-800">Rezervasyonu iptal et</p>
      {err && <p role="alert" className="rounded-lg bg-white p-2 text-sm font-medium text-red-700">{err}</p>}
      <div>
        <label htmlFor={`rs-${id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">İptal sebebi *</label>
        <textarea id={`rs-${id}`} rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. Müşteri tarih değiştirdi, tekne müsait değil, fiyatta anlaşılamadı" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base" />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy/60">Kanıt dosyaları (isteğe bağlı)</p>
        <input ref={input} type="file" multiple accept="image/*,application/pdf" hidden onChange={(e) => add(e.target.files)} />
        <button type="button" onClick={() => input.current?.click()} className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold">Fotoğraf / PDF ekle</button>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                <span className="min-w-0 truncate">{f.name}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="shrink-0 text-xs font-semibold text-red-700">Kaldır</button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs text-navy/55">Örneğin müşterinin iptal yazışmasının ekran görüntüsü. En çok 10 dosya.</p>
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={submit} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "İptal ediliyor…" : "İptali onayla"}</button>
        <button type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold">Vazgeç</button>
      </div>
    </div>
  );
}
