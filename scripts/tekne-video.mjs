// Bir teknenin fotoğraflarından tanıtım videosu üretir (hareketli fotoğraf slaytı, yapay zekâ görüntüsü değildir).
// Kullanım: node scripts/tekne-video.mjs <tekne-adresi> [--yatay] [--sure 3] [--foto 8] [--muzik dosya.mp3] [--dil tr|en]
// Gerekenler: ffmpeg (PATH üzerinde) ve sharp (npm install). Çıktı: videolar/<adres>-<dikey|yatay>.mp4
import { readFileSync, readdirSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const die = (msg) => {
  console.error(`Hata: ${msg}`);
  process.exit(1);
};

if (!slug) die("Tekne adresi gerekli. Örnek: node scripts/tekne-video.mjs nevra-queen");
if (spawnSync("ffmpeg", ["-version"]).status !== 0) die("ffmpeg bulunamadı. Kurup PATH'e ekleyin.");

const boats = JSON.parse(readFileSync("icerik/tekneler.json", "utf8"));
const boat = boats[slug];
if (!boat || slug.startsWith("_")) die(`"${slug}" icerik/tekneler.json içinde yok.`);
const info = boat.bilgi ?? {};
const en = opt("dil", "tr") === "en";

const dir = [`icerik/temiz/${slug}`, `public/tekneler/${slug}`].find((d) => existsSync(d));
if (!dir) die(`"${slug}" için fotoğraf klasörü yok.`);
const maxPhotos = Math.min(12, Math.max(3, Number(opt("foto", 8)) || 8));
const photos = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().slice(0, maxPhotos);
if (photos.length < 3) die(`En az 3 fotoğraf gerekli, ${photos.length} bulundu.`);

const landscape = flag("yatay");
const [W, H] = landscape ? [1920, 1080] : [1080, 1920];
const FPS = 30;
const D = Math.min(6, Math.max(2, Number(opt("sure", 3)) || 3)); // fotoğraf başına saniye
const T = 0.6; // geçiş süresi
const OUTRO = 3;
const music = opt("muzik", "");
if (music && !existsSync(music)) die(`Müzik dosyası bulunamadı: ${music}`);

const TYPES = { gulet: ["Gulet", "Gulet"], motoryat: ["Motoryat", "Motor Yacht"], katamaran: ["Katamaran", "Catamaran"], yelkenli: ["Yelkenli", "Sailing Yacht"] };
const typeName = (TYPES[info.tip] ?? [info.tip ?? "", info.tip ?? ""])[en ? 1 : 0];
const name = boat.ad ?? info.name ?? slug;

// Yalnızca veride gerçekten bulunan bilgiler yazılır.
const facts = [];
if (info.length_m) facts.push(en ? `${info.length_m} m ${typeName}` : `${info.length_m} metre ${typeName}`);
if (info.cabins && info.guests) facts.push(en ? `${info.cabins} cabins · ${info.guests} guests` : `${info.cabins} kabin · ${info.guests} misafir`);
if (info.crew) facts.push(en ? `Crew of ${info.crew}` : `${info.crew} kişilik mürettebat`);
if (info.home_port) facts.push(en ? `Based in ${info.home_port}` : `Bağlama limanı: ${info.home_port}`);
for (const e of (info.equipment ?? []).slice(0, 2)) facts.push(String(e).split(" — ")[0]);
const toys = (info.water_sports ?? []).slice(0, 3).map((s) => String(s).split(" — ")[0].replace(/\s*×\d+$/, ""));
if (toys.length) facts.push(toys.join(" · "));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FONT = "Inter, 'Segoe UI', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";
const u = Math.min(W, H) / 1080; // ölçek birimi
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);

const tmp = mkdtempSync(path.join(tmpdir(), "tekne-video-"));
const logo = existsSync("public/logo-beyaz.png") ? "public/logo-beyaz.png" : null;
const logoBuf = async (width) => (logo ? sharp(logo).resize({ width: Math.round(width) }).png().toBuffer() : null);

// Her kare: bulanık arka plan + sığdırılmış fotoğraf. Yakınlaşma payı için 1,5 kat büyük üretilir.
const S = 1.5;
const slide = async (file, i) => {
  const src = path.join(dir, file);
  const bw = Math.round(W * S);
  const bh = Math.round(H * S);
  const bg = await sharp(src).rotate().resize(bw, bh, { fit: "cover" }).blur(40).modulate({ brightness: 0.55 }).toBuffer();
  const fg = await sharp(src).rotate().resize(bw, bh, { fit: landscape ? "cover" : "inside" }).toBuffer();
  const out = path.join(tmp, `s${i}.jpg`);
  await sharp(bg).composite([{ input: fg, gravity: "center" }]).jpeg({ quality: 92 }).toFile(out);
  return out;
};

// Alt yazı katmanı (saydam): ilk karede başlık, diğerlerinde tek bilgi satırı.
const caption = async (i) => {
  const out = path.join(tmp, `c${i}.png`);
  const shade = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041a35" stop-opacity="0"/><stop offset="1" stop-color="#041a35" stop-opacity="0.85"/></linearGradient>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041a35" stop-opacity="0.6"/><stop offset="1" stop-color="#041a35" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="url(#g)"/><rect x="0" y="0" width="${W}" height="${H * 0.16}" fill="url(#t)"/>`;
  const baseY = H - (landscape ? 90 : 250) * u;
  let text;
  if (i === 0) {
    const size = Math.min(110 * u, (W * 0.86) / (name.length * 0.56));
    text = `<text x="${W / 2}" y="${baseY - 70 * u}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="800" fill="#f4efe6">${esc(name)}</text>
      <rect x="${W / 2 - 60 * u}" y="${baseY - 40 * u}" width="${120 * u}" height="${6 * u}" rx="${3 * u}" fill="#1bb4c4"/>
      <text x="${W / 2}" y="${baseY + 28 * u}" text-anchor="middle" font-family="${FONT}" font-size="${44 * u}" font-weight="600" fill="#f4efe6">${esc(facts[0] ?? typeName)}</text>`;
  } else {
    const fact = facts[i % facts.length] ?? "";
    const size = Math.min(58 * u, (W * 0.86) / (Math.max(8, fact.length) * 0.54));
    text = fact ? `<text x="${W / 2}" y="${baseY}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#f4efe6">${esc(fact)}</text>` : "";
  }
  const layers = [];
  const lb = await logoBuf(230 * u);
  if (lb) layers.push({ input: lb, top: Math.round(56 * u), left: Math.round(56 * u) });
  await sharp(svg(shade + text)).composite(layers).png().toFile(out);
  return out;
};

const outro = async () => {
  const out = path.join(tmp, "outro.png");
  const line = en ? "Request a booking" : "Rezervasyon talebi için";
  const body = `<rect width="${W}" height="${H}" fill="#06264b"/>
    <text x="${W / 2}" y="${H / 2 + 90 * u}" text-anchor="middle" font-family="${FONT}" font-size="${46 * u}" font-weight="500" fill="#f4efe6">${esc(line)}</text>
    <text x="${W / 2}" y="${H / 2 + 170 * u}" text-anchor="middle" font-family="${FONT}" font-size="${64 * u}" font-weight="800" fill="#1bb4c4">yatpaketi.com</text>`;
  const lb = await logoBuf(520 * u);
  const layers = [];
  if (lb) {
    const m = await sharp(lb).metadata();
    layers.push({ input: lb, left: Math.round((W - m.width) / 2), top: Math.round(H / 2 - 60 * u - m.height) });
  }
  await sharp(svg(body)).composite(layers).png().toFile(out);
  return out;
};

console.log(`${name}: ${photos.length} fotoğraf, ${W}x${H}, hazırlanıyor…`);
const slides = [];
const caps = [];
for (let i = 0; i < photos.length; i++) {
  slides.push(await slide(photos[i], i));
  caps.push(await caption(i));
}
const outroFile = await outro();

// ffmpeg: her fotoğrafa yavaş yakınlaşma, üstüne yazı katmanı, aralarında yumuşak geçiş, sonda kapanış kartı.
const N = photos.length;
const frames = Math.round(D * FPS);
const input = [];
for (const s of slides) input.push("-i", s);
for (const c of caps) input.push("-loop", "1", "-t", String(D), "-i", c);
input.push("-loop", "1", "-t", String(OUTRO), "-i", outroFile);
if (music) input.push("-i", music);

const f = [];
for (let i = 0; i < N; i++) {
  // tek sayılı karelerde uzaklaşma, çift sayılılarda yakınlaşma
  const z = i % 2 === 0 ? `1+0.10*on/${frames}` : `1.10-0.10*on/${frames}`;
  f.push(`[${i}:v]zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p[z${i}]`);
  f.push(`[${N + i}:v]fps=${FPS},format=rgba[c${i}]`);
  f.push(`[z${i}][c${i}]overlay=0:0:shortest=1,format=yuv420p,setsar=1[v${i}]`);
}
f.push(`[${2 * N}:v]fps=${FPS},scale=${W}:${H},format=yuv420p,setsar=1[v${N}]`);
let last = "v0";
for (let i = 1; i <= N; i++) {
  const offset = (i * (D - T)).toFixed(3);
  f.push(`[${last}][v${i}]xfade=transition=fade:duration=${T}:offset=${offset}[x${i}]`);
  last = `x${i}`;
}
const total = N * D + OUTRO - N * T;
f.push(`[${last}]fade=t=out:st=${(total - 0.5).toFixed(3)}:d=0.5[vout]`);
if (music) f.push(`[${2 * N + 1}:a]atrim=0:${total.toFixed(3)},afade=t=in:d=0.5,afade=t=out:st=${(total - 1.5).toFixed(3)}:d=1.5[aout]`);

mkdirSync("videolar", { recursive: true });
const outFile = `videolar/${slug}-${landscape ? "yatay" : "dikey"}${en ? "-en" : ""}.mp4`;
const cmd = ["-y", "-hide_banner", "-loglevel", "error", ...input, "-filter_complex", f.join(";"), "-map", "[vout]"];
if (music) cmd.push("-map", "[aout]", "-c:a", "aac", "-b:a", "160k");
cmd.push("-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-t", total.toFixed(3), outFile);

const r = spawnSync("ffmpeg", cmd, { stdio: "inherit" });
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) die("ffmpeg videoyu üretemedi.");
console.log(`Hazır: ${outFile} (${total.toFixed(1)} sn${music ? ", müzikli" : ", sessiz"})`);
