export const fmtTime = (ts: number | null) =>
  ts ? new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

export const fmtDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : ms < 60_000 ? `${(ms / 1000).toFixed(1)} sn` : `${Math.floor(ms / 60_000)} dk ${Math.round((ms % 60_000) / 1000)} sn`);

export const fmtCost = (usd: number) => (usd === 0 ? "0 USD" : `${usd.toFixed(usd < 0.1 ? 4 : 2)} USD (tahmini)`);
