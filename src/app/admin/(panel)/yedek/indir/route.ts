import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Giriş kodu özetleri ve oturum belirteçleri yedeğe konmaz (güvenlik); diğer tüm iş verisi dahildir.
const TABLES = [
  "boats", "boat_images", "boat_destinations", "categories", "destinations", "season_prices", "availability_blocks",
  "reservation_requests", "customer_portals", "portal_checklist", "blog_posts", "site_settings",
];

type Row = Record<string, unknown>;

async function all(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], table: string): Promise<{ rows: Row[]; error?: string }> {
  const rows: Row[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + 999);
    if (error) return { rows, error: error.message };
    const part = (data ?? []) as Row[];
    rows.push(...part);
    if (part.length < 1000) break;
  }
  return { rows };
}

type Sb = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function buildJson(supabase: Sb): Promise<string> {
  const out: Record<string, Row[]> = {};
  const problems: string[] = [];
  for (const t of TABLES) {
    const { rows, error } = await all(supabase, t);
    if (error) problems.push(`${t}: ${error}`);
    out[t] = t === "customer_portals" ? rows.map((r) => { const { code_hash: _c, failed_attempts: _f, locked_until: _l, ...rest } = r; void _c; void _f; void _l; return rest; }) : rows;
  }
  return JSON.stringify({ yedek_tarihi: new Date().toISOString(), uyarilar: problems, tablolar: out }, null, 2);
}

// ---- Basit ZIP yazıcı (sıkıştırmasız "store"; PDF ve JPEG zaten sıkışıktır) ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf: Uint8Array): number { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

type Entry = { name: Uint8Array; crc: number; size: number; offset: number };

function dosTime(d: Date) { return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() }; }

function localHeader(e: Entry, dt: { time: number; date: number }): Uint8Array {
  const h = new DataView(new ArrayBuffer(30));
  h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
  h.setUint16(10, dt.time, true); h.setUint16(12, dt.date, true); h.setUint32(14, e.crc, true);
  h.setUint32(18, e.size, true); h.setUint32(22, e.size, true); h.setUint16(26, e.name.length, true); h.setUint16(28, 0, true);
  const out = new Uint8Array(30 + e.name.length); out.set(new Uint8Array(h.buffer), 0); out.set(e.name, 30); return out;
}

function centralDir(entries: Entry[], dt: { time: number; date: number }, start: number): Uint8Array {
  const parts: Uint8Array[] = []; let size = 0;
  for (const e of entries) {
    const h = new DataView(new ArrayBuffer(46));
    h.setUint32(0, 0x02014b50, true); h.setUint16(4, 20, true); h.setUint16(6, 20, true); h.setUint16(8, 0x0800, true); h.setUint16(10, 0, true);
    h.setUint16(12, dt.time, true); h.setUint16(14, dt.date, true); h.setUint32(16, e.crc, true); h.setUint32(20, e.size, true); h.setUint32(24, e.size, true);
    h.setUint16(28, e.name.length, true); h.setUint32(42, e.offset, true);
    const b = new Uint8Array(46 + e.name.length); b.set(new Uint8Array(h.buffer), 0); b.set(e.name, 46); parts.push(b); size += b.length;
  }
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, size, true); end.setUint32(16, start, true);
  const out = new Uint8Array(size + 22); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } out.set(new Uint8Array(end.buffer), o); return out;
}

// Özel depodaki (contracts) tüm dosyaları klasör klasör listeler.
async function listFiles(supabase: Sb, prefix = "", depth = 0): Promise<string[]> {
  if (depth > 6) return [];
  const files: string[] = [];
  for (let offset = 0; offset < 100000; offset += 1000) {
    const { data, error } = await supabase.storage.from("contracts").list(prefix, { limit: 1000, offset });
    if (error || !data) break;
    for (const f of data) {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      if (f.id) files.push(path); else files.push(...(await listFiles(supabase, path, depth + 1)));
    }
    if (data.length < 1000) break;
  }
  return files;
}

function zipResponse(supabase: Sb, day: string): Response {
  const enc = new TextEncoder();
  const dt = dosTime(new Date());
  const entries: Entry[] = [];
  const failed: string[] = [];
  let offset = 0;
  let queue: string[] | null = null;
  let stage: "json" | "files" | "done" = "json";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const emit = (name: string, data: Uint8Array) => {
          const e: Entry = { name: enc.encode(name), crc: crc32(data), size: data.length, offset };
          entries.push(e);
          const head = localHeader(e, dt);
          controller.enqueue(head); controller.enqueue(data);
          offset += head.length + data.length;
        };
        if (stage === "json") {
          emit("veritabani.json", enc.encode(await buildJson(supabase)));
          queue = await listFiles(supabase);
          stage = "files";
          return;
        }
        if (stage === "files") {
          const path = queue!.shift();
          if (path === undefined) {
            if (failed.length) emit("HATALAR.txt", enc.encode("Şu dosyalar indirilemedi:\n" + failed.join("\n")));
            stage = "done";
            return;
          }
          const { data, error } = await supabase.storage.from("contracts").download(path);
          if (error || !data) { failed.push(path); return; }
          emit("dosyalar/" + path, new Uint8Array(await data.arrayBuffer()));
          return;
        }
        controller.enqueue(centralDir(entries, dt, offset));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="yatpaketi-tam-yedek-${day}.zip"`, "Cache-Control": "no-store" } });
}

const csvCell = (v: unknown) => {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  const { supabase } = await requireAdmin();
  const type = new URL(req.url).searchParams.get("tur");
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

  if (type === "rezervasyonlar") {
    const { rows, error } = await all(supabase, "reservation_requests");
    if (error) return new Response("Okunamadı: " + error, { status: 500 });
    const cols = ["created_at", "status", "customer_name", "phone", "email", "boat_name", "start_date", "end_date", "guests", "message", "admin_notes", "cancel_reason", "cancelled_at"];
    const csv = "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(";"))].join("\r\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="yatpaketi-rezervasyonlar-${day}.csv"`, "Cache-Control": "no-store" } });
  }

  if (type === "zip") return zipResponse(supabase, day);

  const body = await buildJson(supabase);
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="yatpaketi-yedek-${day}.json"`, "Cache-Control": "no-store" } });
}
