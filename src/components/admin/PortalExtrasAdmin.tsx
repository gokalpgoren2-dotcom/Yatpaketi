"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MARKETS, SERVICES, type Guest, type Prefs } from "@/lib/turum";

export type AdminFile = { id: string; kind: "shopping" | "receipt"; title: string; note: string | null; path: string | null; created_at: string; url: string | null };

const card = "rounded-2xl bg-white p-5 shadow-sm";
const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const h2 = "font-display text-xl text-navy";
const fmtD = (d?: string | null) => (d ? new Date(d + "T12:00:00").toLocaleDateString("tr-TR") : "");

function Row({ k, v }: { k: string; v?: React.ReactNode }) {
  if (!v) return null;
  return <div className="grid gap-1 border-t border-navy/10 py-2.5 sm:grid-cols-[11rem_1fr]"><dt className="text-sm font-semibold text-navy/55">{k}</dt><dd className="whitespace-pre-line text-sm text-navy">{v}</dd></div>;
}

export function PortalExtrasAdmin({ portalId, boat, prefs, prefsAt, guests, guestsAt, menus, files, kvkkInfoAt, kvkkHealthAt }: {
  portalId: string; boat: string; prefs: Prefs | null; prefsAt: string | null; guests: Guest[]; guestsAt: string | null; menus: string[]; files: AdminFile[]; kvkkInfoAt: string | null; kvkkHealthAt: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<"shopping" | "receipt">("shopping");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const p = prefs ?? {};
  const has = prefs && Object.keys(prefs).length > 0;
  const stamp = (d: string | null) => (d ? new Date(d).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" }) : "");

  function csv() {
    const head = ["Sıra", "Ad soyad", "Uyruk", "Doğum tarihi", "Cinsiyet", "Belge türü", "Belge no", "Telefon"];
    const rows = guests.map((g, i) => [String(i + 1), g.full_name, g.nationality ?? "", fmtD(g.birth_date), g.gender ?? "", g.doc_type ?? "", g.doc_no ?? "", g.phone ?? ""]);
    const text = "﻿" + [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    a.download = `transit-log-${boat.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
  }

  async function upload() {
    const f = fileRef.current?.files?.[0];
    if (!title.trim()) { setMsg({ ok: false, text: "Başlık yazın (ör. 1. gün alışverişi)." }); return; }
    setBusy(true); setMsg(null);
    let path: string | null = null;
    if (f) {
      const ext = (f.name.split(".").pop() ?? "pdf").toLowerCase();
      path = `alisveris/${portalId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("portal-files").upload(path, f, { contentType: f.type || undefined });
      if (up.error) { setBusy(false); setMsg({ ok: false, text: "Dosya yüklenemedi: " + up.error.message }); return; }
    }
    const { error } = await supabase.from("portal_files").insert({ portal_id: portalId, kind, title: title.trim(), note: note.trim() || null, path });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Kaydedilemedi: " + error.message }); return; }
    setTitle(""); setNote(""); if (fileRef.current) fileRef.current.value = "";
    setMsg({ ok: true, text: "Eklendi. Müşteri Turum'da görebilir." });
    router.refresh();
  }

  async function remove(f: AdminFile) {
    if (!confirm(`"${f.title}" silinsin mi?`)) return;
    if (f.path) await supabase.storage.from("portal-files").remove([f.path]);
    const { error } = await supabase.from("portal_files").delete().eq("id", f.id);
    if (error) { setMsg({ ok: false, text: "Silinemedi: " + error.message }); return; }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Misafir listesi */}
      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={h2}>Misafir listesi (transit log)</h2>
          {guests.length > 0 && <button type="button" onClick={csv} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white">Excel/CSV indir</button>}
        </div>
        {guestsAt && <p className="mt-1 text-xs text-navy/50">Son güncelleme: {stamp(guestsAt)}</p>}
        <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${kvkkInfoAt ? "bg-emerald-100 text-emerald-800" : "bg-navy/10 text-navy/60"}`}>{kvkkInfoAt ? `KVKK aydınlatma onayı: ${stamp(kvkkInfoAt)}` : "KVKK aydınlatma onayı yok"}</p>
        {guests.length === 0 ? <p className="mt-3 text-sm text-navy/60">Müşteri henüz misafir listesini girmedi.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-navy/50"><tr><th className="py-2 pr-3">#</th><th className="pr-3">Ad soyad</th><th className="pr-3">Uyruk</th><th className="pr-3">Doğum</th><th className="pr-3">Cinsiyet</th><th className="pr-3">Belge</th><th>Telefon</th></tr></thead>
              <tbody>
                {guests.map((g, i) => (
                  <tr key={i} className="border-t border-navy/10"><td className="py-2 pr-3 text-navy/50">{i + 1}</td><td className="pr-3 font-medium">{g.full_name}</td><td className="pr-3">{g.nationality}</td><td className="pr-3">{fmtD(g.birth_date)}</td><td className="pr-3">{g.gender}</td><td className="pr-3">{g.doc_type} {g.doc_no}</td><td>{g.phone}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tercihler */}
      <section className={card}>
        <h2 className={h2}>Misafir tercihleri</h2>
        {prefsAt && <p className="mt-1 text-xs text-navy/50">Son güncelleme: {stamp(prefsAt)}</p>}
        {kvkkHealthAt && <p className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Sağlık verisi açık rızası: {stamp(kvkkHealthAt)}</p>}
        {!has ? <p className="mt-3 text-sm text-navy/60">Müşteri henüz tercihlerini girmedi.</p> : (
          <dl className="mt-3">
            <Row k="Market" v={MARKETS.find(([v]) => v === p.market)?.[1]} />
            <Row k="Alerji" v={p.allergy?.has ? p.allergy.text || "Var (açıklama yok)" : p.allergy?.has === false ? "Yok" : ""} />
            <Row k="Kronik hastalık" v={p.chronic?.has ? p.chronic.text || "Var (açıklama yok)" : p.chronic?.has === false ? "Yok" : ""} />
            <Row k="Özel gün" v={p.celebration?.has ? [p.celebration.type, fmtD(p.celebration.date), p.celebration.note].filter(Boolean).join(" · ") || "Var" : p.celebration?.has === false ? "Yok" : ""} />
            <Row k="Hizmet tarzı" v={SERVICES.find(([v]) => v === p.service)?.[1]} />
            <Row k="Aktiviteler" v={[...(p.activities ?? []).filter((a) => a !== "Diğer"), p.activities?.includes("Diğer") ? `Diğer: ${p.activitiesOther || "-"}` : ""].filter(Boolean).join(", ")} />
            <Row k="Not" v={p.notes} />
          </dl>
        )}
      </section>

      {/* Menü seçimi */}
      <section className={card}>
        <h2 className={h2}>Seçilen menüler</h2>
        {menus.length === 0 ? <p className="mt-3 text-sm text-navy/60">Henüz menü seçilmedi. Menüleri <a href="/admin/menuler" className="font-semibold text-turquoise-dark underline">Menüler</a> sayfasından ekleyebilirsiniz.</p> : (
          <ul className="mt-3 flex flex-wrap gap-2">{menus.map((m) => <li key={m} className="rounded-full bg-turquoise/15 px-3 py-1.5 text-sm font-semibold text-navy">{m}</li>)}</ul>
        )}
      </section>

      {/* Alışveriş */}
      <section className={card}>
        <h2 className={h2}>Alışveriş listesi ve fatura</h2>
        <p className="mt-1 text-sm text-navy/60">Alışveriş yapıldıktan sonra alınanların listesini veya faturayı ekleyin; müşteri Turum'da görür.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex gap-2 sm:col-span-2">
            {([["shopping", "Alınanların listesi"], ["receipt", "Fatura / fiş"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setKind(v)} className={`rounded-full border px-4 py-2 text-sm font-medium ${kind === v ? "border-navy bg-navy text-white" : "border-navy/15 text-navy"}`}>{l}</button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (ör. Biniş alışverişi)" className={input} />
          <input ref={fileRef} type="file" accept="application/pdf,image/*" className="text-sm" />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="İsteğe bağlı: alınanları yazabilirsiniz (her satıra bir ürün)" className={`${input} sm:col-span-2`} />
        </div>
        {msg && <p role="status" className={`mt-3 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button type="button" onClick={upload} disabled={busy} className="mt-3 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Yükleniyor…" : "Ekle"}</button>
        {files.length > 0 && (
          <ul className="mt-5 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-mist px-4 py-3">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-navy/60">{f.kind === "receipt" ? "Fatura" : "Liste"}</span>
                <span className="flex-1 text-sm font-medium text-navy">{f.title}</span>
                {f.url && <a href={f.url} target="_blank" rel="noopener" className="text-sm font-semibold text-turquoise-dark">Aç</a>}
                <button type="button" onClick={() => remove(f)} className="text-sm font-semibold text-red-600">Sil</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
