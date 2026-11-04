// Yayın sırasında (Vercel build) çalışır: icerik/tekneler.json + public/tekneler/<adres>/ fotoğraflarını veritabanına işler.
// Her kayıt yalnızca değiştiğinde bir kez uygulanır (site_texts: icerik_sync). Hata olursa yayını durdurmaz, sadece uyarı yazar.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const log = (...a) => console.log("[icerik-sync]", ...a);

// Uzaktaki fotoğrafları indirir: filigranlı kopya herkese açık "media" deposuna (sitede görünür),
// filigransız kopya gizli "brosur-foto" deposuna (yalnızca tanıtım PDF'i) yüklenir.
async function remotePhotos(db, slug, boatId, urls, keepLocal = false, onlyThese = false) {
  let sharp;
  try { sharp = (await import("sharp")).default; } catch { log(slug, "sharp yok, uzak fotoğraflar atlandı."); return 0; }
  const mark = readFileSync("scripts/filigran.png");
  await db.storage.createBucket("brosur-foto", { public: false }).catch(() => null);
  const paths = [];
  let k = 0;
  // Her yüklemede yeni dosya adı: aynı adla yüklenince tarayıcı ve CDN eski fotoğrafı göstermeye devam ediyordu
  const stamp = Date.now().toString(36);
  for (const u of urls.slice(0, 30)) {
    try {
      const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 yatpaketi-icerik" } });
      if (!r.ok) { log(slug, "indirilemedi", r.status, u); continue; }
      const raw = Buffer.from(await r.arrayBuffer());
      const base = sharp(raw).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true });
      const img = await base.jpeg({ quality: 88 }).toBuffer();
      const meta = await sharp(img).metadata();
      // filigran: sol alt köşe
      const W = meta.width ?? 1200, H = meta.height ?? 800;
      const mw = Math.round(W * 0.24);
      const overlay = await sharp(mark).resize({ width: mw }).png().toBuffer();
      const oh = (await sharp(overlay).metadata()).height ?? Math.round(mw / 4);
      const m = Math.round(Math.min(W, H) * 0.035);
      const marked = await sharp(img).composite([{ input: overlay, left: m, top: H - oh - m }]).jpeg({ quality: 86 }).toBuffer();
      k++;
      const name = String(k).padStart(2, "0") + ".jpg";
      const path = `tekneler/${slug}/${stamp}-${name}`;
      const up = await db.storage.from("media").upload(path, marked, { contentType: "image/jpeg", upsert: true });
      if (up.error) { log(slug, "yüklenemedi", up.error.message); k--; continue; }
      paths.push(path);
      if (k <= 13) {
        const clean = await sharp(img).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
        await db.storage.from("brosur-foto").upload(`${slug}/${name}`, clean, { contentType: "image/jpeg", upsert: true });
      }
    } catch (e) {
      log(slug, "fotoğraf hatası", e?.message ?? e);
    }
  }
  if (paths.length < (keepLocal ? 1 : 5)) { log(slug, `uzaktan yalnızca ${paths.length} fotoğraf alınabildi, broşürdeki fotoğraflar kalıyor.`); return paths.length; }
  // Yeterli fotoğraf geldiyse broşürden alınan geçici fotoğraflar kaldırılır, yenileri sırayla eklenir
  if (!keepLocal) await db.from("boat_images").delete().eq("boat_id", boatId).like("path", `/tekneler/${slug}/%`);
  await db.from("boat_images").delete().eq("boat_id", boatId).like("path", `tekneler/${slug}/%`);
  await db.from("boat_images").update({ is_cover: false }).eq("boat_id", boatId);
  // yerel (broşürden alınan) fotoğraflar uzaktan gelenlerin arkasına geçer
  if (keepLocal) {
    const { data: loc } = await db.from("boat_images").select("id,path").eq("boat_id", boatId).like("path", `/tekneler/${slug}/%`).order("path");
    for (const [i, r] of (loc ?? []).entries()) await db.from("boat_images").update({ sort_order: 100 + i }).eq("id", r.id);
  }
  // Yalnızca bu bağlantıdaki fotoğraflar kalsın: yatın diğer tüm fotoğrafları silinir
  if (onlyThese) await db.from("boat_images").delete().eq("boat_id", boatId);
  await db.from("boat_images").insert(paths.map((p, i) => ({ boat_id: boatId, path: p, alt: slug, is_cover: i === 0, sort_order: i })));
  // fazladan kalan eski broşür fotoğrafları
  const { data: old } = await db.storage.from("brosur-foto").list(slug, { limit: 100 });
  const extra = (old ?? []).map((f) => f.name).filter((n) => Number(n.slice(0, 2)) > Math.min(paths.length, 13));
  if (extra.length) await db.storage.from("brosur-foto").remove(extra.map((n) => `${slug}/${n}`));
  // önceki yüklemelerden kalan eski dosyalar silinir
  const { data: prev } = await db.storage.from("media").list(`tekneler/${slug}`, { limit: 200 });
  const stale = (prev ?? []).map((f) => `tekneler/${slug}/${f.name}`).filter((x) => !paths.includes(x));
  if (stale.length) await db.storage.from("media").remove(stale);
  log(slug, `${paths.length} fotoğraf uzaktan alındı.`);
  return paths.length;
}

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

    // Yalnızca sohbetten gönderilen (yerel) fotoğraflar kalsın: uzaktan indirilenler silinir
    if (cfg.sadece_yerel_foto === true) {
      await db.from("boat_images").delete().eq("boat_id", boat.id).like("path", `tekneler/${slug}/%`);
      const { data: st } = await db.storage.from("media").list(`tekneler/${slug}`, { limit: 100 });
      if (st?.length) await db.storage.from("media").remove(st.map((f) => `tekneler/${slug}/${f.name}`));
      const { data: bf } = await db.storage.from("brosur-foto").list(slug, { limit: 100 });
      const extra = (bf ?? []).map((f) => f.name).filter((n) => !clean.includes(n));
      if (extra.length) await db.storage.from("brosur-foto").remove(extra.map((n) => `${slug}/${n}`));
      log(slug, "uzaktan alınan fotoğraflar kaldırıldı.");
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

    if (Array.isArray(cfg.foto_url) && cfg.foto_url.length) await remotePhotos(db, slug, boat.id, cfg.foto_url, cfg.yerel_foto_kalsin === true, cfg.sadece_bu_fotolar === true);

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
