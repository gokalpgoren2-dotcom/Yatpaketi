"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CodeBox } from "./PortalCreate";

export type PortalRow = {
  id: string; email: string; customer_name: string | null; boat_name: string; tour_start: string; tour_end: string; status: string;
  location_text: string | null; location_updated_at: string | null; contract_path: string | null; signed_path: string | null; signed_at: string | null;
};
export type CheckItem = { id: string; label: string; done: boolean; sort_order: number };

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const card = "rounded-2xl bg-white p-5 shadow-sm";
const btn = "rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50";

export function PortalAdmin({ portal, items }: { portal: PortalRow; items: CheckItem[] }) {
  const supabase = createClient();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [list, setList] = useState(items);
  const [loc, setLoc] = useState(portal.location_text ?? "");
  const [newItem, setNewItem] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const say = (ok: boolean, text: string) => { setMsg({ ok, text }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  async function toggle(it: CheckItem) {
    const done = !it.done;
    setList(list.map((x) => (x.id === it.id ? { ...x, done } : x)));
    const { error } = await supabase.from("portal_checklist").update({ done, updated_at: new Date().toISOString() }).eq("id", it.id);
    if (error) { setList(list); say(false, "Kaydedilemedi: " + error.message); }
  }

  async function addItem() {
    const label = newItem.trim();
    if (!label) return;
    const order = (list[list.length - 1]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase.from("portal_checklist").insert({ portal_id: portal.id, label, sort_order: order }).select("id,label,done,sort_order").single();
    if (error || !data) { say(false, "Eklenemedi: " + (error?.message ?? "")); return; }
    setList([...list, data as CheckItem]);
    setNewItem("");
  }

  async function removeItem(it: CheckItem) {
    const { error } = await supabase.from("portal_checklist").delete().eq("id", it.id);
    if (error) { say(false, "Silinemedi: " + error.message); return; }
    setList(list.filter((x) => x.id !== it.id));
  }

  async function saveLoc() {
    setBusy(true);
    const { error } = await supabase.from("customer_portals").update({ location_text: loc.trim() || null, location_updated_at: new Date().toISOString() }).eq("id", portal.id);
    setBusy(false);
    if (error) say(false, "Kaydedilemedi: " + error.message); else { say(true, "Konum güncellendi."); router.refresh(); }
  }

  async function uploadContract(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { say(false, "Dosya 10 MB'tan büyük olamaz."); return; }
    setBusy(true);
    const ext = (f.name.split(".").pop() ?? "pdf").toLowerCase();
    const path = `contract/${crypto.randomUUID()}.${ext}`;
    const type = ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg";
    const up = await supabase.storage.from("contracts").upload(path, f, { contentType: type });
    if (up.error) { setBusy(false); say(false, "Yüklenemedi: " + up.error.message); return; }
    const { error } = await supabase.from("customer_portals").update({ contract_path: path }).eq("id", portal.id);
    setBusy(false);
    if (error) say(false, "Kaydedilemedi: " + error.message); else { say(true, "Sözleşme yüklendi. Müşteri artık görebilir."); router.refresh(); }
    if (file.current) file.current.value = "";
  }

  async function openFile(path: string | null) {
    if (!path) return;
    const { data, error } = await supabase.storage.from("contracts").createSignedUrl(path, 300);
    if (error || !data) { say(false, "Dosya açılamadı: " + (error?.message ?? "")); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function setStatus(status: "active" | "revoked") {
    setBusy(true);
    const { error } = await supabase.from("customer_portals").update({ status }).eq("id", portal.id);
    setBusy(false);
    if (error) say(false, "Kaydedilemedi: " + error.message); else { say(true, status === "revoked" ? "Panel iptal edildi, kod artık çalışmaz." : "Panel yeniden açıldı."); router.refresh(); }
  }

  async function resetCode() {
    setBusy(true);
    const { data, error } = await supabase.rpc("admin_reset_code", { p_id: portal.id });
    setBusy(false);
    if (error || !data) { say(false, "Kod üretilemedi: " + (error?.message ?? "")); return; }
    setCode((data as { code: string }).code);
    router.refresh();
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-xl p-4 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>{msg.text}</p>}

      <section className={card}>
        <p className="text-sm text-navy/70">{portal.email}</p>
        <p className="mt-1 font-medium">{portal.boat_name}</p>
        <p className="text-sm text-navy/60">{portal.tour_start} → {portal.tour_end} · {portal.status === "revoked" ? "İptal edildi" : "Aktif"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={busy} onClick={resetCode}>Yeni kod üret</button>
          {portal.status === "revoked"
            ? <button type="button" className={btn} disabled={busy} onClick={() => setStatus("active")}>Paneli yeniden aç</button>
            : <button type="button" className={`${btn} text-red-700`} disabled={busy} onClick={() => setStatus("revoked")}>Paneli iptal et</button>}
        </div>
        <p className="mt-2 text-xs text-navy/50">Yeni kod üretince eski kod ve açık oturumlar geçersiz olur.</p>
        {code && <div className="mt-4"><CodeBox code={code} email={portal.email} boat={portal.boat_name} /></div>}
      </section>

      <section className={card}>
        <h2 className="font-semibold">Hazırlık listesi</h2>
        <ul className="mt-3 divide-y divide-navy/10">
          {list.map((it) => (
            <li key={it.id} className="flex items-center gap-3 py-3">
              <input type="checkbox" checked={it.done} onChange={() => toggle(it)} className="h-5 w-5 shrink-0" aria-label={it.label} />
              <span className="min-w-0 flex-1 text-sm">{it.label}</span>
              <button type="button" onClick={() => removeItem(it)} className="text-xs font-semibold text-red-700">Sil</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Yeni madde" className={input} />
          <button type="button" onClick={addItem} className={btn}>Ekle</button>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Tekne şu an nerede?</h2>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Örn. Bodrum Yalıkavak Marina'da, tura hazır" className={`${input} mt-3`} />
        <p className="mt-1 text-xs text-navy/50">Müşteri bu yazıyı ve son güncelleme saatini görür.{portal.location_updated_at ? ` Son güncelleme: ${new Date(portal.location_updated_at).toLocaleString("tr-TR")}` : ""}</p>
        <button type="button" onClick={saveLoc} disabled={busy} className="mt-3 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">Konumu kaydet</button>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Sözleşme</h2>
        <input ref={file} type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={(e) => uploadContract(e.target.files)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={busy} onClick={() => file.current?.click()}>{portal.contract_path ? "Sözleşmeyi değiştir" : "Sözleşme yükle (PDF)"}</button>
          {portal.contract_path && <button type="button" className={btn} onClick={() => openFile(portal.contract_path)}>Gönderilen sözleşmeyi aç</button>}
        </div>
        <div className="mt-4 text-sm">
          {portal.signed_path
            ? <><p className="font-medium text-green-800">İmzalı sözleşme yüklendi ({portal.signed_at ? new Date(portal.signed_at).toLocaleString("tr-TR") : ""}).</p><button type="button" className={`${btn} mt-2`} onClick={() => openFile(portal.signed_path)}>İmzalı sözleşmeyi aç</button></>
            : <p className="text-navy/60">Müşteri henüz imzalı sözleşme yüklemedi.</p>}
        </div>
      </section>
    </div>
  );
}
