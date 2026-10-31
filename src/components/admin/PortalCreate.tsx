"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export function CodeBox({ code, email, boat }: { code: string; email?: string; boat?: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Merhaba, ${boat ?? "turunuz"} için müşteri paneli giriş bilgileriniz:\nAdres: https://yatpaketi.vercel.app/musteri\nE-posta: ${email ?? ""}\nKod: ${code}\nKod tur bitiş tarihinden sonra geçersiz olur.`;
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  }
  return (
    <div className="rounded-2xl bg-green-50 p-5 ring-1 ring-green-200">
      <p className="text-sm font-medium text-green-900">Giriş kodu (bir daha gösterilmez, kaybolursa yenisi üretilir):</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-green-900">{code}</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs text-navy/80">{text}</pre>
      <button type="button" onClick={copy} className="mt-3 rounded-xl bg-turquoise px-4 py-2.5 text-sm font-semibold text-white">{copied ? "Kopyalandı" : "Mesajı kopyala"}</button>
      <p className="mt-2 text-xs text-navy/60">Mesajı müşteriye WhatsApp veya e-posta ile siz iletin. Otomatik e-posta, alan adı bağlanınca eklenecek.</p>
    </div>
  );
}

export function PortalCreate() {
  const supabase = createClient();
  const [f, setF] = useState({ email: "", name: "", boat: "", start: "", end: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; code: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function create() {
    setErr("");
    if (!f.email.trim() || !f.boat.trim() || !f.start || !f.end) { setErr("E-posta, tekne ve iki tarih zorunlu."); return; }
    if (f.end < f.start) { setErr("Bitiş tarihi başlangıçtan önce olamaz."); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("admin_create_portal", { p_email: f.email, p_name: f.name, p_boat: f.boat, p_start: f.start, p_end: f.end });
    setBusy(false);
    if (error || !data) { setErr("Oluşturulamadı: " + (error?.message ?? "bilinmeyen hata") + " (Müşteri paneli SQL kodunu Supabase'e yapıştırdınız mı?)"); return; }
    setDone(data as { id: string; code: string });
  }

  if (done) {
    return (
      <div className="space-y-4">
        <CodeBox code={done.code} email={f.email} boat={f.boat} />
        <Link href={`/admin/musteri-panelleri/${done.id}`} className="inline-block rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Paneli yönet</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
      <div><label htmlFor="pe" className={lab}>Müşteri e-postası *</label><input id="pe" type="email" value={f.email} onChange={set("email")} className={input} /></div>
      <div><label htmlFor="pn" className={lab}>Müşteri adı</label><input id="pn" value={f.name} onChange={set("name")} className={input} /></div>
      <div><label htmlFor="pb" className={lab}>Tekne *</label><input id="pb" value={f.boat} onChange={set("boat")} className={input} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="ps" className={lab}>Tur başlangıcı *</label><input id="ps" type="date" value={f.start} onChange={set("start")} className={input} /></div>
        <div><label htmlFor="pd" className={lab}>Tur bitişi *</label><input id="pd" type="date" value={f.end} onChange={set("end")} className={input} /></div>
      </div>
      <button type="button" onClick={create} disabled={busy} className="w-full rounded-xl bg-turquoise px-6 py-3.5 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Oluşturuluyor…" : "Panel aç ve kod üret"}</button>
    </div>
  );
}
