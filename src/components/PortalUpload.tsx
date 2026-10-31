"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { startUpload, finishUpload } from "@/app/musteri/actions";
import { shrink } from "@/lib/shrink";

// İmzalı sözleşmeyi yükler. Dosya doğrudan özel depoya gider; yol yalnızca bu müşteriye ve 15 dakikaya özeldir.
export function PortalUpload({ replace }: { replace: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function pick(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setMsg(null);
    if (f.size > 10 * 1024 * 1024) { setMsg({ ok: false, text: "Dosya 10 MB'tan büyük olamaz." }); return; }
    let ext = (f.name.split(".").pop() ?? "").toLowerCase();
    let body: Blob = f;
    setBusy(true);
    try {
      // iPhone fotoğrafları (HEIC) ve diğer görseller JPEG'e çevrilir; PDF ve PNG olduğu gibi gider.
      if (ext !== "pdf" && ext !== "png" && (f.type.startsWith("image/") || ["heic", "heif", "jpeg", "jpg"].includes(ext))) { body = await shrink(f); ext = "jpg"; }
      const slot = await startUpload(ext);
      if (!slot.path) throw new Error(slot.error ?? "Yükleme başlatılamadı.");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
      const type = ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg";
      const up = await sb.storage.from("contracts").upload(slot.path, body, { contentType: type, upsert: false });
      if (up.error) throw new Error("Dosya yüklenemedi. Lütfen tekrar deneyin.");
      const done = await finishUpload(slot.path);
      if (!done.ok) throw new Error("Yükleme tamamlanamadı. Lütfen tekrar deneyin.");
      setMsg({ ok: true, text: "İmzalı sözleşmeniz yüklendi. Teşekkürler." });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Bir sorun oluştu." });
    }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <input ref={ref} type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={(e) => pick(e.target.files)} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="w-full rounded-xl bg-turquoise px-5 py-3.5 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">
        {busy ? "Yükleniyor…" : replace ? "Yeniden yükle" : "İmzalı sözleşmeyi yükle"}
      </button>
      <p className="mt-2 text-xs text-navy/55">PDF, JPG veya PNG, en çok 10 MB.</p>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 rounded-xl p-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
    </div>
  );
}
