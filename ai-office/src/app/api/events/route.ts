import { guard } from "@/server/http";
import { getBus } from "@/server/bus";
import { getRunner } from "@/server/runner";
import type { BusMessage } from "@/shared/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Canlı durum akışı (SSE). Bağlantı koparsa tarayıcı yeniden bağlanır ve /api/state ile eşitlenir.
export async function GET(req: Request) {
  const blocked = await guard(req);
  if (blocked) return blocked;
  getRunner();
  const bus = getBus();
  const enc = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(enc.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const onMsg = (m: BusMessage) => send(`event: ${m.kind}\ndata: ${JSON.stringify(m.kind === "job" ? m.job : m.event)}\n\n`);
      const ping = setInterval(() => send(": ping\n\n"), 20_000);
      cleanup = () => {
        clearInterval(ping);
        bus.off("msg", onMsg);
      };
      bus.on("msg", onMsg);
      req.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          /* zaten kapalı */
        }
      });
      send("retry: 3000\n\n");
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
