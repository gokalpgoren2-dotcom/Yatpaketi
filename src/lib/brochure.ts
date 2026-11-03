// Yat tanıtım PDF'i (broşür). Yat sayfasındaki güncel bilgilerden A4 PDF üretir:
// kapak, yat hakkında + teknik özellikler, fiyatlar + dahil/hariç, fotoğraf galerisi.
import { PDFDocument, rgb, StandardFonts, pushGraphicsState, popGraphicsState, rectangle, clip, endPath, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Boat } from "./data";
import { dailyFor, weeklyFor, SEASON_MONTHS, monthName, money, off, apaText } from "./pricing";

type Contact = { phone: string; whatsapp: string; email: string; instagram: string };
export type BrochureAssets = {
  fonts?: { light: Uint8Array; regular: Uint8Array; medium: Uint8Array; bold: Uint8Array } | null;
  fontkit?: unknown;
  logo?: Uint8Array | null; // saydam, renkli (iç sayfalar)
  logoWhite?: Uint8Array | null; // saydam, beyaz (kapak)
  photos: Uint8Array[]; // kapak ilk sırada
};

const W = 595.28, H = 841.89, M = 44;
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const NAVY = hex("#06264b"), NAVY2 = hex("#0b3566"), TURQ = hex("#1bb4c4"), TURQD = hex("#0f95a4"), MIST = hex("#f2f6f8"), INK = hex("#06264b"), MUTED = hex("#5d6f84"), RED = hex("#e8453c"), WHITE = rgb(1, 1, 1), LINE = hex("#dde5ec");

// Standart yazı tipine düşülürse Türkçe harfler sadeleştirilir (normalde Poppins gömülür).
const ascii = (s: string) => s.replace(/[ğĞ]/g, (c) => (c === "ğ" ? "g" : "G")).replace(/[şŞ]/g, (c) => (c === "ş" ? "s" : "S")).replace(/ı/g, "i").replace(/İ/g, "I").replace(/[^\x20-\x7E\xA0-\xFF€–—•’“”]/g, "");

export async function buildBrochure(b: Boat, contact: Contact, a: BrochureAssets, lang: "tr" | "en" = "tr"): Promise<Uint8Array> {
  const en = lang === "en";
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${b.name} — ${en ? "Yacht brochure" : "Yat tanıtım dosyası"}`);
  pdf.setAuthor("yatpaketi");
  pdf.setSubject(`${b.name} ${b.type}`);

  let L: PDFFont, R: PDFFont, Md: PDFFont, B: PDFFont, plain = false;
  try {
    if (!a.fonts || !a.fontkit) throw new Error("no fonts");
    pdf.registerFontkit(a.fontkit as Parameters<PDFDocument["registerFontkit"]>[0]);
    [L, R, Md, B] = await Promise.all([a.fonts.light, a.fonts.regular, a.fonts.medium, a.fonts.bold].map((f) => pdf.embedFont(f, { subset: true })));
  } catch {
    plain = true;
    R = await pdf.embedFont(StandardFonts.Helvetica);
    L = R;
    B = await pdf.embedFont(StandardFonts.HelveticaBold);
    Md = B;
  }
  const T = (s: string) => (plain ? ascii(s) : s);

  const imgs: PDFImage[] = [];
  for (const p of a.photos) {
    try {
      if (p[0] === 0xff && p[1] === 0xd8) imgs.push(await pdf.embedJpg(p));
      else if (p[0] === 0x89 && p[1] === 0x50) imgs.push(await pdf.embedPng(p));
    } catch { /* okunamayan fotoğraf atlanır */ }
  }
  let logo: PDFImage | null = null;
  try { if (a.logo) logo = await pdf.embedPng(a.logo); } catch { logo = null; }
  let logoW: PDFImage | null = null;
  try { if (a.logoWhite) logoW = await pdf.embedPng(a.logoWhite); } catch { logoW = null; }

  // ---- yardımcılar ----
  const text = (pg: PDFPage, s: string, x: number, y: number, size: number, font: PDFFont, color = INK) => pg.drawText(T(s), { x, y, size, font, color });
  const width = (s: string, size: number, font: PDFFont) => font.widthOfTextAtSize(T(s), size);
  const wrap = (s: string, size: number, font: PDFFont, maxW: number) => {
    const out: string[] = [];
    for (const para of s.split(/\n/)) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = "";
      for (const w of words) {
        const t = line ? `${line} ${w}` : w;
        if (width(t, size, font) <= maxW) line = t;
        else { if (line) out.push(line); line = w; }
      }
      out.push(line);
    }
    return out;
  };
  // Fotoğrafı kutuya kırparak yerleştir (object-fit: cover)
  const cover = (pg: PDFPage, img: PDFImage, x: number, y: number, w: number, h: number) => {
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s, ih = img.height * s;
    pg.pushOperators(pushGraphicsState(), rectangle(x, y, w, h), clip(), endPath());
    pg.drawImage(img, { x: x - (iw - w) / 2, y: y - (ih - h) / 2, width: iw, height: ih });
    pg.pushOperators(popGraphicsState());
  };
  let pageNo = 0;
  const footer = (pg: PDFPage) => {
    pageNo++;
    pg.drawLine({ start: { x: M, y: 40 }, end: { x: W - M, y: 40 }, thickness: 0.6, color: LINE });
    const parts = "yatpaketi.com";
    text(pg, parts, M, 24, 8, R, MUTED);
    const n = String(pageNo);
    text(pg, n, W - M - width(n, 8, R), 24, 8, R, MUTED);
  };
  const header = (pg: PDFPage, title: string) => {
    if (logo) { const h = 20, w = (logo.width / logo.height) * h; pg.drawImage(logo, { x: M, y: H - 34 - h, width: w, height: h }); }
    const t = `${b.name}  ·  ${title}`;
    text(pg, t, W - M - width(t, 8.5, Md), H - 47, 8.5, Md, MUTED);
    pg.drawLine({ start: { x: M, y: H - 62 }, end: { x: W - M, y: H - 62 }, thickness: 0.6, color: LINE });
  };
  const h2 = (pg: PDFPage, s: string, y: number) => {
    pg.drawRectangle({ x: M, y: y - 2, width: 3, height: 15, color: TURQ });
    text(pg, s, M + 11, y, 14, B, NAVY);
    return y - 26;
  };

  // ---- veriler ----
  const specs: [string, string][] = [
    [en ? "Length" : "Boy", b.length > 0 ? `${b.length} m` : "–"],
    [en ? "Cabins" : "Kabin", b.cabins > 0 ? String(b.cabins) : "–"],
    [en ? "Guests" : "Misafir", String(b.guests)],
    [en ? "Crew" : "Personel", b.crew > 0 ? String(b.crew) : "–"],
    [en ? "Built / Refit" : "Yapım / Refit", b.year ? `${b.year}${b.refit ? ` (${b.refit})` : ""}` : "–"],
  ];
  const pct = b.offer?.percent ?? 0;

  // ================= 1) KAPAK =================
  {
    const pg = pdf.addPage([W, H]);
    const photoH = H * 0.62;
    if (imgs[0]) cover(pg, imgs[0], 0, H - photoH, W, photoH);
    else pg.drawRectangle({ x: 0, y: H - photoH, width: W, height: photoH, color: NAVY2 });
    // üstte saydam beyaz logo; okunabilsin diye fotoğrafın üstüne hafif koyu geçiş
    for (let i = 0; i < 12; i++) pg.drawRectangle({ x: 0, y: H - (i + 1) * 10, width: W, height: 10, color: NAVY, opacity: 0.32 * (1 - i / 12) });
    const lg = logoW ?? logo;
    if (lg) {
      const h = 28, w = (lg.width / lg.height) * h;
      pg.drawImage(lg, { x: M, y: H - 34 - h, width: w, height: h });
    }
    // alt lacivert bölüm
    pg.drawRectangle({ x: 0, y: 0, width: W, height: H - photoH, color: NAVY });
    pg.drawRectangle({ x: 0, y: H - photoH - 3, width: W, height: 3, color: TURQ });
    let y = H - photoH - 58;
    text(pg, (b.type || (en ? "Yacht" : "Yat")).toLocaleUpperCase(en ? "en" : "tr") + (b.port ? `   ·   ${b.port.toLocaleUpperCase(en ? "en" : "tr")}` : ""), M, y, 9.5, Md, TURQ);
    y -= 44;
    const nameSize = width(b.name, 40, B) > W - 2 * M ? 30 : 40;
    text(pg, b.name, M, y, nameSize, B, WHITE);
    y -= 26;
    text(pg, en ? "Yacht brochure" : "Yat tanıtım dosyası", M, y, 11, L, hex("#b8c7d8"));
    // özellik kutuları
    y -= 40;
    const gap = 8, bw = (W - 2 * M - gap * 4) / 5, bh = 58;
    specs.forEach(([k, v], i) => {
      const x = M + i * (bw + gap);
      pg.drawRectangle({ x, y: y - bh, width: bw, height: bh, color: NAVY2, borderColor: hex("#1d4a7a"), borderWidth: 0.6 });
      const vs = width(v, 15, B) > bw - 12 ? 11.5 : 15;
      text(pg, v, x + (bw - width(v, vs, B)) / 2, y - 27, vs, B, WHITE);
      text(pg, k.toLocaleUpperCase(en ? "en" : "tr"), x + (bw - width(k.toLocaleUpperCase(en ? "en" : "tr"), 7, Md)) / 2, y - 44, 7, Md, hex("#8fb3cf"));
    });
    y -= bh + 40;
    const site = "yatpaketi.com";
    pg.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.6, color: hex("#1d4a7a") });
    text(pg, site, M, y - 14, 12, B, TURQ);
    pageNo++;
  }

  // ================= 2) YAT HAKKINDA + ÖZELLİKLER =================
  {
    let pg = pdf.addPage([W, H]);
    header(pg, en ? "About the yacht" : "Yat hakkında");
    let y = H - 96;
    const newPage = () => { footer(pg); pg = pdf.addPage([W, H]); header(pg, en ? "About the yacht" : "Yat hakkında"); y = H - 96; };
    const need = (h: number) => { if (y - h < 60) newPage(); };

    if (b.description.trim()) {
      y = h2(pg, en ? "About the yacht" : "Yat hakkında", y);
      for (const ln of wrap(b.description.trim(), 10, L, W - 2 * M)) {
        need(15);
        if (ln) text(pg, ln, M, y, 10, L, hex("#24384f"));
        y -= ln ? 15.5 : 8;
      }
      y -= 14;
    }

    // teknik özellikler tablosu
    const rows: [string, string][] = [
      [en ? "Yacht type" : "Yat tipi", b.type || "–"],
      [en ? "Home port" : "Çıkış limanı", b.port || "–"],
      [en ? "Length" : "Boy", b.length > 0 ? `${b.length} m` : "–"],
      [en ? "Beam" : "Genişlik", b.width > 0 ? `${b.width} m` : "–"],
      [en ? "Cabins" : "Kabin", b.cabins > 0 ? String(b.cabins) : "–"],
      [en ? "Guests" : "Misafir", String(b.guests)],
      [en ? "Crew" : "Personel", b.crew > 0 ? String(b.crew) : "–"],
      [en ? "Built" : "Yapım yılı", b.year ? String(b.year) : "–"],
      [en ? "Refit" : "Refit", b.refit ? String(b.refit) : "–"],
      [en ? "Builder / model" : "Tersane / model", [b.brand, b.model].filter(Boolean).join(" ") || "–"],
      [en ? "Captain" : "Kaptan", b.captained ? (en ? "Included (crewed)" : "Dahil (mürettebatlı)") : (en ? "Bareboat" : "Kaptansız")],
    ];
    need(40 + Math.ceil(rows.length / 2) * 26);
    y = h2(pg, en ? "Specifications" : "Teknik özellikler", y);
    const colW = (W - 2 * M - 16) / 2;
    rows.forEach(([k, v], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + col * (colW + 16), yy = y - row * 26;
      pg.drawLine({ start: { x, y: yy - 8 }, end: { x: x + colW, y: yy - 8 }, thickness: 0.5, color: LINE });
      text(pg, k, x, yy, 9.5, R, MUTED);
      const vv = wrap(v, 9.5, Md, colW * 0.55)[0] ?? v;
      text(pg, vv, x + colW - width(vv, 9.5, Md), yy, 9.5, Md, INK);
    });
    y -= Math.ceil(rows.length / 2) * 26 + 18;

    // donanım ve su oyuncakları: etiket kutucukları
    const chips = (title: string, items: string[]) => {
      if (!items.length) return;
      need(70);
      y = h2(pg, title, y);
      let x = M;
      for (const raw of items) {
        const s = raw.replace(/\s+—\s+/g, " · ");
        const w = Math.min(width(s, 8.8, R) + 20, W - 2 * M);
        if (x + w > W - M) { x = M; y -= 26; need(26); }
        pg.drawRectangle({ x, y: y - 7, width: w, height: 20, color: MIST, borderColor: LINE, borderWidth: 0.5 });
        pg.drawCircle({ x: x + 8, y: y + 3, size: 1.8, color: TURQ });
        text(pg, s, x + 14, y - 0.5, 8.8, R, INK);
        x += w + 6;
      }
      y -= 40;
    };
    chips(en ? "Equipment" : "Donanım", b.equipment);
    chips(en ? "Water sports & toys" : "Su sporları ve oyuncaklar", b.waterSports);
    footer(pg);
  }

  // ================= 3) FİYATLAR =================
  {
    const pg = pdf.addPage([W, H]);
    header(pg, en ? "Prices" : "Fiyatlar");
    let y = H - 96;
    y = h2(pg, en ? "Charter prices" : "Kiralama fiyatları", y);
    const months = SEASON_MONTHS.filter((m) => dailyFor(b, m) != null);
    if (!b.showPrice || !months.length) {
      text(pg, en ? "Please contact us for prices." : "Fiyat bilgisi için bizimle iletişime geçin.", M, y, 10.5, R, MUTED);
      y -= 30;
    } else {
      const showW = months.some((m) => weeklyFor(b, m) != null);
      const cols = 4, gap = 8, cw = (W - 2 * M - gap * (cols - 1)) / cols, ch = showW ? 66 : 54;
      months.forEach((m, i) => {
        const x = M + (i % cols) * (cw + gap), yy = y - Math.floor(i / cols) * (ch + gap);
        pg.drawRectangle({ x, y: yy - ch, width: cw, height: ch, color: MIST, borderColor: LINE, borderWidth: 0.5 });
        text(pg, monthName(m, lang), x + 10, yy - 16, 9, Md, MUTED);
        const d = dailyFor(b, m)!;
        const v = money(pct ? off(d, pct) : d, b.currency, lang);
        text(pg, v, x + 10, yy - 36, 14, B, pct ? RED : NAVY);
        text(pg, en ? "/ day" : "/ gün", x + 12 + width(v, 14, B), yy - 36, 8, R, MUTED);
        const wk = weeklyFor(b, m);
        if (showW && wk != null) text(pg, `${en ? "Weekly" : "Haftalık"}: ${money(pct ? off(wk, pct) : wk, b.currency, lang)}`, x + 10, yy - 54, 8, R, TURQD);
      });
      y -= Math.ceil(months.length / cols) * (ch + gap) + 10;
      const notes: string[] = [];
      if (pct) notes.push(en ? `Prices shown include the current ${pct}% discount.` : `Gösterilen fiyatlara geçerli %${pct} indirim uygulanmıştır.`);
      if (b.vatMode === "excluded") notes.push(en ? `Prices exclude ${b.vatRate}% VAT.` : `Fiyatlara %${b.vatRate} KDV dahil değildir.`);
      if (b.vatMode === "included") notes.push(en ? "Prices include VAT." : "Fiyatlara KDV dahildir.");
      notes.push(en ? "Total = sum of nights (check-out day not charged)." : "Toplam ücret, konaklanan gecelerin toplamıdır (çıkış günü ücretlendirilmez).");
      for (const n of notes) { text(pg, `•  ${n}`, M, y, 8.8, R, MUTED); y -= 14; }
      if (b.apa) {
        y -= 6;
        const lines = wrap(apaText(b.apa, lang), 8.8, R, W - 2 * M - 28);
        const bh = 26 + lines.length * 13;
        pg.drawRectangle({ x: M, y: y - bh + 12, width: W - 2 * M, height: bh, color: hex("#e9f8fa"), borderColor: hex("#bfe9ee"), borderWidth: 0.6 });
        text(pg, `APA %${b.apa}`, M + 14, y - 4, 10, B, TURQD);
        lines.forEach((ln, i) => text(pg, ln, M + 14, y - 20 - i * 13, 8.8, R, INK));
        y -= bh + 8;
      }
      y -= 10;
    }

    // dahil / hariç
    const inc = b.included ?? [], exc = b.excluded ?? [];
    if (inc.length || exc.length) {
      y = h2(pg, en ? "Included & not included" : "Fiyata dahil olanlar / olmayanlar", y);
      const colW = (W - 2 * M - 16) / 2;
      const col = (items: string[], x: number, title: string, good: boolean) => {
        let yy = y;
        pg.drawRectangle({ x, y: yy - 6, width: colW, height: 24, color: good ? hex("#e7f7ef") : hex("#fdeceb") });
        text(pg, title, x + 12, yy + 1.5, 9.5, B, good ? hex("#137a4b") : hex("#c0332b"));
        yy -= 26;
        for (const it of items) {
          const lines = wrap(it, 9, R, colW - 26);
          if (yy - lines.length * 13 < 60) break;
          // işaret: tik ya da çarpı (yazı tipinden bağımsız çizilir)
          if (good) pg.drawSvgPath("M0 4 L3.5 7.5 L10 0", { x: x + 9, y: yy + 8, borderColor: hex("#1f9d63"), borderWidth: 1.6 });
          else pg.drawSvgPath("M0 0 L7 7 M7 0 L0 7", { x: x + 10, y: yy + 7.5, borderColor: RED, borderWidth: 1.4 });
          lines.forEach((ln, i) => text(pg, ln, x + 24, yy - i * 13, 9, R, INK));
          yy -= lines.length * 13 + 6;
        }
        return yy;
      };
      const y1 = col(inc, M, en ? "Included" : "Dahil olanlar", true);
      const y2 = col(exc, M + colW + 16, en ? "Not included" : "Dahil olmayanlar", false);
      y = Math.min(y1, y2) - 12;
    }

    // iletişim kutusu
    if (y > 150) {
      const bh = 78, by = Math.min(y - 10, 150);
      pg.drawRectangle({ x: M, y: by - bh, width: W - 2 * M, height: bh, color: NAVY });
      text(pg, en ? "Book or ask a question" : "Rezervasyon ve bilgi için", M + 20, by - 28, 13, B, WHITE);
      const line = [contact.phone && `${en ? "Phone" : "Telefon"}: ${contact.phone}`, contact.email].filter(Boolean).join("     ");
      text(pg, line || "yatpaketi.com", M + 20, by - 48, 9.5, R, hex("#b8c7d8"));
      text(pg, `yatpaketi.com/tekneler/${b.slug}`, M + 20, by - 64, 9.5, Md, TURQ);
    }
    footer(pg);
  }

  // ================= 4) GALERİ =================
  const gal = imgs.slice(1, 13);
  for (let p = 0; p < gal.length; p += 6) {
    const pg = pdf.addPage([W, H]);
    header(pg, en ? "Gallery" : "Fotoğraflar");
    const set = gal.slice(p, p + 6);
    const gap = 10, top = H - 80, bottom = 56;
    const cw = (W - 2 * M - gap) / 2, ch = (top - bottom - gap * 2) / 3;
    set.forEach((img, i) => {
      const x = M + (i % 2) * (cw + gap), y = top - (Math.floor(i / 2) + 1) * ch - Math.floor(i / 2) * gap;
      cover(pg, img, x, y, cw, ch);
    });
    footer(pg);
  }

  return pdf.save();
}
