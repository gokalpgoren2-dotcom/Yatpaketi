"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { shrink } from "@/lib/shrink";
import { refreshSite } from "@/app/admin/(panel)/icerik/actions";

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";
const btn = "rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-50";

type Dest = { id: string; name: string; cover_path: string };
type Msg = { ok: boolean; text: string } | null;

async function uploadImage(file: File) {
  const supabase = createClient();
  const blob = await shrink(file);
  const path = `site/${crypto.randomUUID()}.jpg`;
  const up = await supabase.storage.from("media").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (up.error) throw new Error(up.error.message);
  return path;
}

async function removeOld(path: string) {
  if (path) await createClient().storage.from("media").remove([path]).catch(() => undefined);
}

export function SiteContentEditor({ initial, destinations }: { initial: { hero_path: string; title: string; subtitle: string }; destinations: Dest[] }) {
  const supabase = createClient();
  const heroFile = useRef<HTMLInputElement>(null);
  const [hero, setHero] = useState(initial.hero_path);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [dests, setDests] = useState<Dest[]>(destinations);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  async function saveHome(next: { hero_path: string; title: string; subtitle: string }) {
    const { error } = await supabase.from("site_settings").upsert({ key: "home", value: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await refreshSite();
  }

  async function run(key: string, fn: () => Promise<void>, okText: string) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
    } catch (e) {
      setMsg({ ok: false, text: "Olmadı: " + (e instanceof Error ? e.message : "bilinmeyen hata") });
    } finally {
      setBusy(null);
    }
  }

  async function pickHero(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    await run("hero", async () => {
      const path = await uploadImage(f);
      try {
        await saveHome({ hero_path: path, title, subtitle });
      } catch (e) {
        await removeOld(path);
        throw e;
      }
      await removeOld(hero);
      setHero(path);
    }, "Ana sayfa fotoğrafı kaydedildi.");
    if (heroFile.current) heroFile.current.value = "";
  }

  async function pickDest(d: Dest, files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    await run("d" + d.id, async () => {
      const path = await uploadImage(f);
      const { error } = await supabase.from("destinations").update({ cover_path: path }).eq("id", d.id);
      if (error) {
        await removeOld(path);
        throw new Error(error.message);
      }
      await removeOld(d.cover_path);
      setDests((list) => list.map((x) => (x.id === d.id ? { ...x, cover_path: path } : x)));
      await refreshSite();
    }, d.name + " fotoğrafı kaydedildi.");
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
          {msg.text}
        </p>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Ana sayfa büyük fotoğraf</h2>
        <p className="mt-1 text-sm text-navy/60">Yatay (geniş) bir deniz veya tekne fotoğrafı seçin. Yazılar fotoğrafın üstünde beyaz görünür; çok açık renkli fotoğraflarda okunmayabilir.</p>
        <div className="mt-4 overflow-hidden rounded-xl bg-mist">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={BASE + hero} alt="Ana sayfa fotoğrafı" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <p className="p-8 text-center text-sm text-navy/50">Fotoğraf yok. Sitede çizimli arka plan görünüyor.</p>
          )}
        </div>
        <input ref={heroFile} type="file" accept="image/*" hidden onChange={(e) => pickHero(e.target.files)} />
        <button type="button" disabled={busy !== null} onClick={() => heroFile.current?.click()} className={`${btn} mt-3`}>
          {busy === "hero" ? "Yükleniyor…" : hero ? "Fotoğrafı değiştir" : "Fotoğraf seç"}
        </button>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Ana sayfa yazıları</h2>
        <div>
          <label htmlFor="t" className={lab}>Başlık</label>
          <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hayalinizdeki mavi yolculuğu kiralayın" maxLength={90} className={input} />
        </div>
        <div>
          <label htmlFor="s" className={lab}>Alt yazı</label>
          <textarea id="s" rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={200} className={input} />
        </div>
        <p className="text-xs text-navy/50">Boş bırakırsanız varsayılan yazılar kullanılır.</p>
        <button type="button" disabled={busy !== null} onClick={() => run("text", () => saveHome({ hero_path: hero, title: title.trim(), subtitle: subtitle.trim() }), "Yazılar kaydedildi.")}
          className="rounded-xl bg-turquoise px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {busy === "text" ? "Kaydediliyor…" : "Yazıları kaydet"}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Destinasyon fotoğrafları</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {dests.map((d) => (
            <li key={d.id} className="overflow-hidden rounded-xl ring-1 ring-navy/10">
              {d.cover_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={BASE + d.cover_path} alt={d.name} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-mist text-sm text-navy/50">Fotoğraf yok</div>
              )}
              <div className="flex items-center justify-between gap-3 p-3">
                <span className="font-medium">{d.name}</span>
                <label className={`${btn} cursor-pointer ${busy !== null ? "pointer-events-none opacity-50" : ""}`}>
                  {busy === "d" + d.id ? "Yükleniyor…" : d.cover_path ? "Değiştir" : "Fotoğraf seç"}
                  <input type="file" accept="image/*" hidden onChange={(e) => { pickDest(d, e.target.files); e.target.value = ""; }} />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
