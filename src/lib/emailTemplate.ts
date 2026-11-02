// Markalı e-posta şablonu. E-posta istemcileri için tablo düzeni ve satır içi stil kullanılır.
const NAVY = "#06264b";
const TURQ = "#1bb4c4";

const baseUrl = () => (process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app").replace(/\/+$/, "");

export const esc2 = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

// Vurgulu buton (ör. "Müşteri paneline git").
export const mailButton = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td style="border-radius:12px;background:${TURQ}"><a href="${href}" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:12px">${esc2(label)}</a></td></tr></table>`;

// Giriş kodu gibi öne çıkan kutu.
export const mailCode = (label: string, value: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0"><tr><td style="background:#f2f7fa;border:1px solid #dbe7ee;border-radius:14px;padding:16px 18px;text-align:center"><div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b7c93">${esc2(label)}</div><div style="margin-top:6px;font-family:Menlo,Consolas,monospace;font-size:26px;font-weight:bold;letter-spacing:3px;color:${NAVY}">${esc2(value)}</div></td></tr></table>`;

// Bilgi satırları (ör. yat, tarih).
export const mailFacts = (rows: [string, string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;border-top:1px solid #e5edf2">${rows
    .map(([k, v]) => `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e5edf2;font-size:13px;color:#6b7c93;white-space:nowrap">${esc2(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e5edf2;font-size:15px;font-weight:bold;color:${NAVY}">${esc2(v)}</td></tr>`)
    .join("")}</table>`;

export function brandedMail(inner: string, opts: { title?: string; preheader?: string } = {}): string {
  const base = baseUrl();
  const pre = opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f2f7fa">${esc2(opts.preheader)}</div>` : "";
  const title = opts.title ? `<h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${NAVY};font-weight:normal">${esc2(opts.title)}</h1>` : "";
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#eef3f7">${pre}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#eef3f7"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px">
    <tr><td style="background:#ffffff;border-radius:20px 20px 0 0;padding:20px 28px;border-bottom:4px solid ${TURQ}">
      <a href="${base}" style="text-decoration:none"><img src="${base}/logo.png" alt="Yatpaketi" width="150" style="display:block;border:0;height:auto;max-width:150px"></a>
    </td></tr>
    <tr><td style="background:#ffffff;padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:${NAVY}">
      ${title}${inner}
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:8px 28px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${NAVY}">
      <p style="margin:18px 0 0">İyi yolculuklar dileriz,<br><b>Yatpaketi ekibi</b></p>
    </td></tr>
    <tr><td style="padding:16px 12px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8294a8">
      Bu e-posta rezervasyonunuz nedeniyle gönderilmiştir.<br><a href="${base}" style="color:#8294a8">yatpaketi.vercel.app</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}
