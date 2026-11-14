// Kullanım: node render.js satilik-reels.html [cikti.mp4] [--kareler 1,3,6,10]
// HTML içindeki window.renderAt(t) fonksiyonunu kare kare çalıştırır, ffmpeg ile MP4 yapar.
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

(async () => {
  const [html, out = "cikti/" + path.basename(process.argv[2], ".html") + ".mp4"] =
    process.argv.slice(2).filter(a => !a.startsWith("--") && !/^[\d.,]+$/.test(a));
  const kIdx = process.argv.indexOf("--kareler");
  const FPS = 30;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.resolve(html) + "?render=1");
  await page.evaluate(() => window.HAZIR);
  const sure = await page.evaluate(() => window.SURE);

  if (kIdx > -1) { // sadece önizleme kareleri
    for (const t of process.argv[kIdx + 1].split(",").map(Number)) {
      await page.evaluate(t => renderAt(t), t);
      await page.screenshot({ path: `cikti/onizleme-${t}s.png` });
    }
    await browser.close(); return;
  }

  const dir = fs.mkdtempSync("/tmp/kareler-");
  const n = Math.round(sure * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => renderAt(t), i / FPS);
    await page.screenshot({ path: `${dir}/${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 95 });
  }
  await browser.close();
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/%05d.jpg`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", out]);
  fs.rmSync(dir, { recursive: true });
  console.log("Hazır:", out);
})();
