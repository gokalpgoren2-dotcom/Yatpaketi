"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DateRangePicker } from "@/components/DateRangePicker";
import { sendPortalEmail } from "@/app/admin/(panel)/musteri-panelleri/actions";

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export function CodeBox({ code, email, boat, portalId, autoSend = false }: { code: string; email?: string; boat?: string; portalId?: string; autoSend?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [mail, setMail] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const sent = useRef(false);
  async function send() {
    if (!portalId) return;
    setSending(true);
    setMail(null);
    const r = await Promise.race([
      sendPortalEmail(portalId, code).catch(() => ({ ok: false, message: "E-posta gönderilemedi (sunucu hatası). Kodu elle iletin." })),
      new Promise<{ ok: boolean; message: string }>((res) => setTimeout(() => res({ ok: false, message: "E-posta zaman aşımına uğradı. Gelen kutunuzu kontrol edin, gelmediyse kodu elle iletin." }), 25000)),
    ]);
    setMail({ ok: r.ok, text: r.message });
    setSending(false);
  }
  useEffect(() => {
    if (autoSend && portalId && !sent.current) { sent.current = true; void send(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const text = `Merhaba, ${boat ?? "turunuz"} için müşteri paneli giriş bilgileriniz:\nAdres: https://yatpaketi.vercel.app/musteri\nE-posta: ${email ?? ""}\nKod: ${code}\nKod tur bitiş tarihinden sonra geçersiz olur.`;
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  }
  return (
    <div className="rounded-2xl bg-green-50 p-5 ring-1 ring-green-200">
      <p className="text-sm font-medium text-green-900">Giriş kodu (bir daha gösterilmez, kaybolursa yenisi üretilir):</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-green-900">{code}</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs text-navy/80">{text}</pre>
      {mail && <p role={mail.ok ? "status" : "alert"} className={`mt-3 rounded-xl p-3 text-sm font-medium ${mail.ok ? "bg-white text-green-800" : "bg-red-50 text-red-700"}`}>{sending ? "Gönderiliyor…" : mail.text}</p>}
      {sending && !mail && <p className="mt-3 text-sm text-navy/70">E-posta gönderiliyor…</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {portalId && <button type="button" onClick={send} disabled={sending} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{mail?.ok ? "Tekrar gönder" : "E-postayla gönder"}</button>}
        <button type="button" onClick={copy} className="rounded-xl bg-turquoise px-4 py-2.5 text-sm font-semibold text-white">{copied ? "Kopyalandı" : "Mesajı kopyala"}</button>
      </div>
      <p className="mt-2 text-xs text-navy/60">E-posta gitmezse mesajı kopyalayıp WhatsApp'tan iletebilirsiniz.</p>
    </div>
  );
}

export function PortalCreate({ initial }: { initial?: { email?: string; name?: string; boat?: string; start?: string; end?: string } }) {
  const supabase = createClient();
  const [f, setF] = useState({ email: initial?.email ?? "", name: initial?.name ?? "", boat: initial?.boat ?? "", start: initial?.start ?? "", end: initial?.end ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; code: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function create() {
    setErr("");
    if (!f.email.trim() || !f.boat.trim() || !f.start || !f.end) { setErr("E-posta, yat ve tur tarihleri (giriş ve çıkış) zorunlu."); return; }
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
        <CodeBox code={done.code} email={f.email.trim().toLowerCase()} boat={f.boat} portalId={done.id} autoSend />
        <Link href={`/admin/musteri-panelleri/${done.id}`} className="inline-block rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Paneli yönet</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
      <div><label htmlFor="pe" className={lab}>Müşteri e-postası *</label><input id="pe" type="email" value={f.email} onChange={set("email")} className={input} /></div>
      <div><label htmlFor="pn" className={lab}>Müşteri adı</label><input id="pn" value={f.name} onChange={set("name")} className={input} /></div>
      <div><label htmlFor="pb" className={lab}>Yat *</label><input id="pb" value={f.boat} onChange={set("boat")} className={input} /></div>
      <DateRangePicker label="Tur tarihleri *" start={f.start} end={f.end} allowPast onChange={(a, b) => setF({ ...f, start: a, end: b })} />
      <button type="button" onClick={create} disabled={busy} className="w-full rounded-xl bg-turquoise px-6 py-3.5 text-base font-semibold text-white disabled:opacity-60 sm:w-auto">{busy ? "Oluşturuluyor…" : "Panel aç ve kod üret"}</button>
    </div>
  );
}
