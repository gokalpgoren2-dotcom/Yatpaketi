"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AdminMenu = { id: string; title: string; description: string | null; file_path: string | null; sort_order: number; active: boolean; url: string | null };

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";

export function MenusAdmin({ initial }: { initial: AdminMenu[] }) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function add() {
    if (!title.trim()) { setMsg({ ok: false, text: "Menü adı yazın." }); return; }
    setBusy(true); setMsg(null);
    const f = fileRef.current?.files?.[0];
    let path: string | null = null;
    if (f) {
      const ext = (f.name.split(".").pop() ?? "pdf").toLowerCase();
      path = `menuler/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("portal-files").upload(path, f, { contentType: f.type || undefined });
      if (up.error) { setBusy(false); setMsg({ ok: false, text: "Dosya yüklenemedi: " + up.error.message }); return; }
    }
    const order = (initial[initial.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from("portal_menus").insert({ title: title.trim(), description: desc.trim() || null, file_path: path, sort_order: order });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Kaydedilemedi: " + error.message }); return; }
    setTitle(""); setDesc(""); if (fileRef.current) fileRef.current.value = "";
    setMsg({ ok: true, text: "Menü eklendi." });
    router.refresh();
  }

  async function toggle(m: AdminMenu) {
    const { error } = await supabase.from("portal_menus").update({ active: !m.active }).eq("id", m.id);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    router.refresh();
  }

  async function remove(m: AdminMenu) {
    if (!confirm(`"${m.title}" silinsin mi? Müşterilerin bu menüyle ilgili seçimleri de silinir.`)) return;
    if (m.file_path) await supabase.storage.from("portal-files").remove([m.file_path]);
    const { error } = await supabase.from("portal_menus").delete().eq("id", m.id);
    if (error) { setMsg({ ok: false, text: "Silinemedi: " + error.message }); return; }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl text-navy">Yeni menü</h2>
        <div className="mt-4 grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Menü adı (ör. Ege Mezeleri ve Izgara Balık)" className={input} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="İçerik (her satıra bir yemek yazabilirsiniz)" className={input} />
          <label className="text-sm text-navy/70">İsteğe bağlı: menü dosyası (PDF veya fotoğraf)
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="mt-1 block text-sm" />
          </label>
        </div>
        {msg && <p role="status" className={`mt-3 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button type="button" onClick={add} disabled={busy} className="mt-3 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Ekleniyor…" : "Menüyü ekle"}</button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl text-navy">Menüler ({initial.length})</h2>
        {initial.length === 0 ? <p className="mt-3 text-sm text-navy/60">Henüz menü yok.</p> : (
          <ul className="mt-4 space-y-2.5">
            {initial.map((m) => (
              <li key={m.id} className={`rounded-xl p-4 ${m.active ? "bg-mist" : "bg-mist/50 opacity-70"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex-1 font-semibold text-navy">{m.title}</span>
                  {m.url && <a href={m.url} target="_blank" rel="noopener" className="text-sm font-semibold text-turquoise-dark">Dosya</a>}
                  <button type="button" onClick={() => toggle(m)} className="rounded-full border border-navy/15 px-3 py-1 text-xs font-semibold">{m.active ? "Yayında · gizle" : "Gizli · yayınla"}</button>
                  <button type="button" onClick={() => remove(m)} className="text-sm font-semibold text-red-600">Sil</button>
                </div>
                {m.description && <p className="mt-1.5 whitespace-pre-line text-sm text-navy/65">{m.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
