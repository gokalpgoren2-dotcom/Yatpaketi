"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STARTER_POSTS } from "@/lib/starter-posts";

// Başlangıç taslaklarını TASLAK olarak ekler. Aynı adresli yazı varsa atlanır.
export function SeedPosts() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function add() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const rows = STARTER_POSTS.map((p) => ({
      kind: p.kind, slug: p.slug, title_tr: p.title, excerpt_tr: p.excerpt, content_tr: p.content, sort_order: p.sort, status: "draft",
    }));
    const { error } = await supabase.from("blog_posts").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
    if (error) setMsg({ ok: false, text: "Eklenemedi: " + error.message + (error.message.includes("kind") ? " (Önce Supabase'e yazılar SQL kodunu yapıştırın.)" : "") });
    else {
      setMsg({ ok: true, text: "Taslaklar eklendi. Hiçbiri yayında değil; sırayla açıp düzeltin ve yayınlayın." });
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Başlangıç taslakları</h2>
      <p className="mt-1 text-sm text-navy/60">Yatpaketi Rehberi için 7 yazı, ayrıca Hakkımızda, SSS ve İptal politikası taslağı ekler. Hepsi “taslak” olarak eklenir, siz düzeltip yayınlayana kadar sitede görünmez.</p>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 rounded-xl p-3 text-sm font-medium ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="button" onClick={add} disabled={busy} className="mt-4 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Ekleniyor…" : "Başlangıç taslaklarını ekle"}</button>
    </div>
  );
}
