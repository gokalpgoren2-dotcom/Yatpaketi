// Telefon numarasını uluslararası biçime (yalnızca rakam, ülke koduyla) çevirir.
// 0541 681 23 14, 541 681 23 14, +90 541 681 23 14 ve 0090... hepsi 905416812314 olur.
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = "90" + d.slice(1);
  else if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return d;
}

// Ekranda gösterim: Türkiye numaraları "0541 681 23 14", diğerleri "+kod numara".
export function formatPhone(d: string): string {
  if (d.startsWith("90") && d.length === 12) {
    const n = d.slice(2);
    return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  }
  return d ? `+${d}` : "";
}
