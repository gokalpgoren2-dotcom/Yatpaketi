"use client";

import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { shrink } from "@/lib/shrink";
import { startReviewPhoto, submitReview } from "@/app/yorum/actions";
import { startPortalReviewPhoto, submitPortalReview } from "@/app/musteri/actions";
import type { Lang } from "@/lib/i18n";

const T = {
  tr: { rating: "Puanınız", name: "Adınız (sitede görünür)", nameHint: "İsterseniz yalnızca adınız ve soyadınızın baş harfi: Ayşe K.", body: "Deneyiminiz", bodyPh: "Yat, mürettebat ve rotanız hakkında neler düşünüyorsunuz?", photo: "Fotoğraf ekle (isteğe bağlı)", photoChange: "Fotoğrafı değiştir", remove: "Kaldır", send: "Yorumu gönder", sending: "Gönderiliyor…", short: "Lütfen en az 10 karakterlik bir yorum yazın.", star: "yıldız", noRating: "Lütfen yıldız verin.", consent: "Yorumum ve fotoğrafım, onaylandıktan sonra yatpaketi sitesinde yayınlanabilir.", done: "Teşekkürler!", doneText: "Yorumunuzu aldık. Ekibimiz inceledikten sonra sitede yayınlanacak." },
  en: { rating: "Your rating", name: "Your name (shown on the site)", nameHint: "You may use your first name and last initial: Anna K.", body: "Your experience", bodyPh: "What did you think of the yacht, the crew and your route?", photo: "Add a photo (optional)", photoChange: "Change photo", remove: "Remove", send: "Send review", sending: "Sending…", short: "Please write at least 10 characters.", star: "stars", noRating: "Please choose a rating.", consent: "My review and photo may be published on the Yatpaketi site once approved.", done: "Thank you!", doneText: "We received your review. It will appear on the site once our team has checked it." },
};
const input = "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-base text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";

export function ReviewForm({ token, lang, defaultName }: { token: string | null; lang: Lang; defaultName: string }) {
  // token null: Turum sayfasından (oturumla), dolu: e-postadaki bağlantıdan
  const L = T[lang === "tr" ? "tr" : "en"];
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState(defaultName);
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<{ blob: Blob; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function pick(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    try {
      const blob = await shrink(f);
      setPhoto({ blob, preview: URL.createObjectURL(blob) });
    } catch {
      setErr(lang !== "tr" ? "This photo could not be used." : "Bu fotoğraf kullanılamadı.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!rating) return setErr(L.noRating);
    if (body.trim().length < 10) return setErr(L.short);
    setBusy(true);
    try {
      let path: string | null = null;
      if (photo) {
        const slot = token ? await startReviewPhoto(token) : await startPortalReviewPhoto();
        if (!slot.path) throw new Error(slot.error ?? "");
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
        const up = await sb.storage.from("reviews").upload(slot.path, photo.blob, { contentType: "image/jpeg", upsert: false });
        if (up.error) throw new Error(lang !== "tr" ? "The photo could not be uploaded. Please try again." : "Fotoğraf yüklenemedi. Lütfen tekrar deneyin.");
        path = slot.path;
      }
      const r = token ? await submitReview(token, name.trim(), rating, body.trim(), path) : await submitPortalReview(name.trim(), rating, body.trim(), path);
      if (!r.ok) throw new Error(r.error ?? "");
      setDone(true);
    } catch (e2) {
      setErr((e2 instanceof Error && e2.message) || (lang !== "tr" ? "Something went wrong. Please try again." : "Bir sorun oluştu. Lütfen tekrar deneyin."));
    }
    setBusy(false);
  }

  if (done) return (
    <div role="status" className="rounded-3xl bg-green-50 p-8 text-center ring-1 ring-green-200">
      <p className="font-display text-3xl text-navy">{L.done}</p>
      <p className="mt-2 text-navy/75">{L.doneText}</p>
    </div>
  );

  return (
    <form onSubmit={send} className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy">{L.rating}</legend>
        <div className="flex gap-1.5" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} ${L.star}`} onClick={() => setRating(n)} className="rounded-lg p-1">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className={n <= rating ? "text-[#f5a623]" : "text-navy/15"}><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">{L.name}</span>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        <span className="mt-1 block text-xs text-navy/55">{L.nameHint}</span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">{L.body}</span>
        <textarea className={`${input} min-h-36`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} placeholder={L.bodyPh} required />
      </label>
      <div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files)} />
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.preview} alt="" className="mb-3 aspect-[4/3] w-full max-w-xs rounded-2xl object-cover" />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl border border-navy/20 px-4 py-2.5 text-sm font-semibold text-navy">{photo ? L.photoChange : L.photo}</button>
          {photo && <button type="button" onClick={() => setPhoto(null)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">{L.remove}</button>}
        </div>
      </div>
      <p className="text-xs text-navy/55">{L.consent}</p>
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-full bg-turquoise px-8 py-4 text-base font-semibold text-white transition hover:bg-turquoise-dark disabled:opacity-60 sm:w-auto">{busy ? L.sending : L.send}</button>
    </form>
  );
}
