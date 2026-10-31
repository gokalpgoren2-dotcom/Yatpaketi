"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseCoords } from "@/lib/coords";

/* eslint-disable @typescript-eslint/no-explicit-any */
const LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist";

function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = `${LEAFLET}/leaflet.css`; css.setAttribute("data-leaflet", "1");
      document.head.appendChild(css);
    }
    const js = document.createElement("script");
    js.src = `${LEAFLET}/leaflet.js`;
    js.onload = () => resolve((window as any).L);
    js.onerror = () => reject(new Error("Harita yüklenemedi"));
    document.head.appendChild(js);
  });
}

type Props = { portalId: string; lat: number | null; lng: number | null; text: string | null; updatedAt: string | null; opensAt: string };

// Tekne konumunu haritada dokunarak ya da koordinat/harita bağlantısı yapıştırarak işaretler.
export function LocationPicker({ portalId, lat, lng, text, updatedAt, opensAt }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(lat !== null && lng !== null ? { lat, lng } : null);
  const [note, setNote] = useState(text ?? "");
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mapErr, setMapErr] = useState("");

  function put(p: { lat: number; lng: number }, pan = false) {
    setPos(p);
    const L = (window as any).L;
    if (!L || !map.current) return;
    if (marker.current) marker.current.setLatLng([p.lat, p.lng]);
    else marker.current = L.marker([p.lat, p.lng]).addTo(map.current);
    if (pan) map.current.setView([p.lat, p.lng], Math.max(map.current.getZoom(), 12));
  }

  useEffect(() => {
    let dead = false;
    loadLeaflet().then((L) => {
      if (dead || !box.current || map.current) return;
      const start: [number, number] = pos ? [pos.lat, pos.lng] : [37.0, 28.0];
      map.current = L.map(box.current).setView(start, pos ? 12 : 8);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map.current);
      if (pos) marker.current = L.marker(start).addTo(map.current);
      map.current.on("click", (e: any) => put({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) }));
    }).catch((e) => setMapErr(e.message));
    return () => { dead = true; if (map.current) { map.current.remove(); map.current = null; marker.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyPaste() {
    const c = parseCoords(paste);
    if (!c) { setMsg({ ok: false, text: "Koordinat bulunamadı. Örnek: 36.8512, 28.2701. Kısa harita bağlantıları (goo.gl) okunamaz; haritada konuma uzun basıp koordinatı kopyalayın." }); return; }
    setMsg(null);
    put(c, true);
    setPaste("");
  }

  async function save() {
    if (!pos) { setMsg({ ok: false, text: "Önce haritada bir yere dokunun ya da koordinat yapıştırın." }); return; }
    setBusy(true);
    const { error } = await supabase.from("customer_portals").update({ lat: pos.lat, lng: pos.lng, location_text: note.trim() || null, location_updated_at: new Date().toISOString() }).eq("id", portalId);
    setBusy(false);
    if (error) setMsg({ ok: false, text: "Kaydedilemedi: " + error.message + (error.message.includes("lat") || error.message.includes("lng") ? " (Supabase'e harita SQL kodunu yapıştırdınız mı?)" : "") });
    else { setMsg({ ok: true, text: "Konum kaydedildi." }); router.refresh(); }
  }

  async function clear() {
    setBusy(true);
    const { error } = await supabase.from("customer_portals").update({ lat: null, lng: null, location_text: null, location_updated_at: null }).eq("id", portalId);
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Silinemedi: " + error.message }); return; }
    if (marker.current) { marker.current.remove(); marker.current = null; }
    setPos(null); setNote("");
    setMsg({ ok: true, text: "Konum kaldırıldı." });
    router.refresh();
  }

  const opens = new Date(opensAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "long", timeStyle: "short" });
  const field = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/70">Müşteri bu konumu <b>{opens}</b> tarihinden itibaren (tura 12 saat kala) görür. Öncesinde hiçbir konum bilgisi müşteriye gönderilmez.</p>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      {mapErr ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{mapErr}. Koordinatı aşağıdaki kutuya yapıştırarak da girebilirsiniz.</p> : <div ref={box} className="h-72 w-full overflow-hidden rounded-xl bg-mist" aria-label="Konum haritası" />}
      <p className="text-xs text-navy/55">Haritada teknenin olduğu yere dokunun. Yakınlaştırmak için iki parmakla büyütün.</p>
      <div className="flex gap-2">
        <input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Koordinat ya da harita bağlantısı yapıştırın" className={field} />
        <button type="button" onClick={applyPaste} className="shrink-0 rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold">Uygula</button>
      </div>
      {pos && <p className="text-sm text-navy/70">Seçilen konum: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</p>}
      <div>
        <label htmlFor="locnote" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Müşteriye not (isteğe bağlı)</label>
        <input id="locnote" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Örn. Bodrum Yalıkavak Marina, C pontonu" className={field} />
      </div>
      {updatedAt && <p className="text-xs text-navy/50">Son kayıt: {new Date(updatedAt).toLocaleString("tr-TR")}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={busy} className="rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Kaydediliyor…" : "Konumu kaydet"}</button>
        {(lat !== null || text) && <button type="button" onClick={clear} disabled={busy} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-60">Konumu kaldır</button>}
      </div>
    </div>
  );
}
