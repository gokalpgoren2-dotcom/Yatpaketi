"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Img = { id: string; path: string; is_cover: boolean; sort_order: number };

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;

// Yüklemeden önce görseli küçültür (en uzun kenar 2400 px, JPEG %85). iPhone fotoğrafları çok büyüktür.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi");
  ctx.drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Görsel işlenemedi"))), "image/jpeg", 0.85));
}

export function PhotoManager({ boatId, initial }: { boatId: string; initial: Img[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Img[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function reload() {
    const { data } = await supabase.from("boat_images").select("id,path,is_cover,sort_order").eq("boat_id", boatId).order("sort_order");
    setImages((data ?? []) as Img[]);
    router.refresh();
  }

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      let order = images.reduce((m, i) => Math.max(m, i.sort_order), 0);
      let first = images.length === 0;
      let done = 0;
      for (const file of Array.from(files)) {
        const blob = await shrink(file);
        const path = `boats/${boatId}/${crypto.randomUUID()}.jpg`;
        const up = await supabase.storage.from("media").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (up.error) throw new Error(up.error.message);
        order += 1;
        const ins = await supabase.from("boat_images").insert({ boat_id: boatId, path, sort_order: order, is_cover: first });
        if (ins.error) {
          await supabase.storage.from("media").remove([path]);
          throw new Error(ins.error.message);
        }
        first = false;
        done += 1;
      }
      setMsg({ ok: true, text: `${done} fotoğraf yüklendi.` });
    } catch (e) {
      setMsg({ ok: false, text: "Yükleme başarısız: " + (e instanceof Error ? e.message : "bilinmeyen hata") });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
      await reload();
      setBusy(false);
    }
  }

  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    setMsg(null);
    const { error } = await fn();
    if (error) setMsg({ ok: false, text: error.message });
    await reload();
    setBusy(false);
  }

  const setCover = (img: Img) =>
    run(async () => {
      const a = await supabase.from("boat_images").update({ is_cover: false }).eq("boat_id", boatId);
      if (a.error) return a;
      return supabase.from("boat_images").update({ is_cover: true }).eq("id", img.id);
    });

  const move = (i: number, dir: -1 | 1) => {
    const a = images[i];
    const b = images[i + dir];
    if (!a || !b) return;
    return run(async () => {
      const r1 = await supabase.from("boat_images").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (r1.error) return r1;
      return supabase.from("boat_images").update({ sort_order: a.sort_order }).eq("id", b.id);
    });
  };

  const remove = (img: Img) =>
    run(async () => {
      await supabase.storage.from("media").remove([img.path]);
      const r = await supabase.from("boat_images").delete().eq("id", img.id);
      if (!r.error && img.is_cover) {
        const { data } = await supabase.from("boat_images").select("id").eq("boat_id", boatId).order("sort_order").limit(1);
        if (data && data[0]) await supabase.from("boat_images").update({ is_cover: true }).eq("id", data[0].id);
      }
      return r;
    });

  return (
    <div className="mt-3">
      <input ref={fileRef} id="photos" type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} className="hidden" />
      <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "İşleniyor…" : "Fotoğraf ekle"}
      </button>
      <span className="ml-3 text-xs text-navy/50">Telefon galerinizden birden fazla seçebilirsiniz.</span>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm ${msg.ok ? "text-green-800" : "text-red-700"}`}>{msg.text}</p>}

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-navy/60">Henüz fotoğraf yok.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-navy/10">
              <div className="relative aspect-[4/3] bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BASE + img.path} alt="" className="h-full w-full object-cover" />
                {img.is_cover && <span className="absolute left-2 top-2 rounded-full bg-turquoise px-2.5 py-1 text-xs font-semibold text-white">Kapak</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 p-2">
                <button type="button" disabled={busy || img.is_cover} onClick={() => setCover(img)} className="rounded-lg border border-navy/15 px-2.5 py-2 text-xs disabled:opacity-40">Kapak yap</button>
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Öne al" className="rounded-lg border border-navy/15 px-3 py-2 text-xs disabled:opacity-40">←</button>
                <button type="button" disabled={busy || i === images.length - 1} onClick={() => move(i, 1)} aria-label="Sona al" className="rounded-lg border border-navy/15 px-3 py-2 text-xs disabled:opacity-40">→</button>
                <button type="button" disabled={busy} onClick={() => remove(img)} className="rounded-lg border border-red-200 px-2.5 py-2 text-xs text-red-700 disabled:opacity-40">Sil</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
