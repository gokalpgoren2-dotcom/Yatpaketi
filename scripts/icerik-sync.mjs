// Yayın sırasında (Vercel build) çalışır: icerik/tekneler.json + public/tekneler/<adres>/ fotoğraflarını veritabanına işler.
// Her kayıt yalnızca değiştiğinde bir kez uygulanır (site_texts: icerik_sync). Hata olursa yayını durdurmaz, sadece uyarı yazar.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const log = (...a) => console.log("[icerik-sync]", ...a);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return log("SUPABASE_SERVICE_ROLE_KEY yok, atlandı.");
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Limanlar: yalnızca eksik olanlar eklenir, var olanlara (panelde düzenlenmiş olabilir) dokunulmaz.
  if (existsSync("icerik/limanlar.json")) {
    const ports = JSON.parse(readFileSync("icerik/limanlar.json", "utf8"));
    for (const [slug, p] of Object.entries(ports)) {
      if (slug.startsWith("_")) continue;
      const { data: ex } = await db.from("destinations").select("id").eq("slug", slug).maybeSingle();
      if (ex) { log("liman", slug, "zaten var."); continue; }
      const { error } = await db.from("destinations").insert({ slug, is_published: true, ...p });
      log("liman", slug, error ? "eklenemedi: " + error.message : "eklendi.");
    }
  }

  if (!existsSync("icerik/tekneler.json")) return log("icerik/tekneler.json yok, atlandı.");
  const list = JSON.parse(readFileSync("icerik/tekneler.json", "utf8"));

  const { data: st } = await db.from("site_texts").select("data").eq("key", "icerik_sync").maybeSingle();
  const done = { ...(st?.data ?? {}) };

  for (const [slug, cfg] of Object.entries(list)) {
    if (slug.startsWith("_")) continue;
    const dir = `public/tekneler/${slug}`;
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
    const paths = files.map((f) => `/tekneler/${slug}/${f}`);
    const cdir = `icerik/temiz/${slug}`;
    const clean = existsSync(cdir) ? readdirSync(cdir).filter((f) => /\.jpe?g$/i.test(f)).sort() : [];
    const hash = createHash("sha1").update(JSON.stringify({ cfg, paths, clean })).digest("hex");
    if (done[slug] === hash) { log(slug, "değişmemiş, atlandı."); continue; }

    let { data: boat, error: be } = await db.from("boats").select("id").eq("slug", slug).maybeSingle();
    // Listede olmayan yat: "ad" verildiyse taslak olarak oluşturulur
    if (!be && !boat && cfg.ad) {
      const ins = await db.from("boats").insert({ slug, name: cfg.ad, is_published: false }).select("id").single();
      if (ins.error) log(slug, "oluşturulamadı: " + ins.error.message);
      else { boat = ins.data; log(slug, "yeni yat oluşturuldu (taslak)."); }
    }
    if (be || !boat) { log(slug, "tekne bulunamadı, atlandı."); continue; }

    // Broşür için filigransız fotoğraflar: gizli depoya yüklenir (sitede görünmez)
    if (clean.length) {
      await db.storage.createBucket("brosur-foto", { public: false }).catch(() => null);
      let n = 0;
      for (const f of clean) {
        const { error } = await db.storage.from("brosur-foto").upload(`${slug}/${f}`, readFileSync(`${cdir}/${f}`), { contentType: "image/jpeg", upsert: true });
        if (!error) n++;
      }
      log(slug, `broşür fotoğrafları: ${n}/${clean.length} yüklendi.`);
    }

    if (paths.length) {
      const { data: imgs } = await db.from("boat_images").select("id,path,sort_order").eq("boat_id", boat.id);
      const have = new Set((imgs ?? []).map((r) => r.path));
      const prefix = `/tekneler/${slug}/`;
      // eski (panelden yüklenen) fotoğraflar yeni setin arkasına geçer, kapak yeni setin ilki olur
      for (const r of imgs ?? []) if (!r.path.startsWith(prefix)) await db.from("boat_images").update({ is_cover: false, sort_order: r.sort_order + 100 }).eq("id", r.id);
      await db.from("boat_images").update({ is_cover: false }).eq("boat_id", boat.id);
      const add = paths.map((p, i) => ({ boat_id: boat.id, path: p, alt: slug, is_cover: i === 0, sort_order: i })).filter((r) => !have.has(r.path));
      if (add.length) await db.from("boat_images").insert(add);
      for (let i = 0; i < paths.length; i++) if (have.has(paths[i])) await db.from("boat_images").update({ sort_order: i, is_cover: i === 0 }).eq("boat_id", boat.id).eq("path", paths[i]);
      log(slug, `${add.length} yeni fotoğraf, toplam ${paths.length}.`);
    }

    const upd = {};
    if (typeof cfg.yayinla === "boolean") upd.is_published = cfg.yayinla;
    if (typeof cfg.one_cikar === "boolean") upd.is_featured = cfg.one_cikar;
    if (Object.keys(upd).length) await db.from("boats").update(upd).eq("id", boat.id);
    // Yat bilgileri (broşürden çıkarılanlar): sütun adlarıyla doğrudan yazılır; "tip" yat tipinin adresidir (gulet, motoryat…)
    if (cfg.bilgi && typeof cfg.bilgi === "object") {
      const { tip, ...cols } = cfg.bilgi;
      if (tip) {
        const { data: c } = await db.from("categories").select("id").eq("slug", tip).maybeSingle();
        if (c) cols.category_id = c.id;
      }
      const { error } = await db.from("boats").update(cols).eq("id", boat.id);
      log(slug, error ? "bilgiler yazılamadı: " + error.message : "bilgiler güncellendi.");
    }
    // Tanıtım PDF'i: site tarafından otomatik üretilen /brosur/<adres>.pdf bağlanır (ayrı güncelleme: sütun yoksa diğerleri etkilenmez)
    if (cfg.brosur === true) {
      const { error } = await db.from("boats").update({ brochure_path: `/brosur/${slug}.pdf` }).eq("id", boat.id);
      log(slug, error ? "broşür bağlanamadı: " + error.message : "broşür bağlandı.");
    }

    if (Number.isInteger(cfg.one_cikan_sira) && cfg.one_cikan_sira > 0) {
      const { data: f } = await db.from("site_texts").select("data").eq("key", "featured").maybeSingle();
      let ord = Array.isArray(f?.data?.order) ? f.data.order.filter((s) => s !== slug) : [];
      if (!ord.length) {
        const { data: fb } = await db.from("boats").select("slug").eq("is_featured", true).eq("is_published", true).neq("slug", slug).order("sort_order").order("name");
        ord = (fb ?? []).map((r) => r.slug);
      }
      ord.splice(Math.min(cfg.one_cikan_sira - 1, ord.length), 0, slug);
      await db.from("site_texts").upsert({ key: "featured", data: { order: ord }, updated_at: new Date().toISOString() });
      log(slug, `öne çıkanlarda ${cfg.one_cikan_sira}. sıra.`);
    }

    done[slug] = hash;
    await db.from("site_texts").upsert({ key: "icerik_sync", data: done, updated_at: new Date().toISOString() });
    log(slug, "işlendi.");
  }
}

main().catch((e) => log("hata (yayın devam ediyor):", e?.message ?? e));
