import { EventEmitter } from "node:events";
import type { BusMessage } from "@/shared/types";

// Süreç içi yayın: yürütme motoru buraya yazar, SSE uç noktası buradan okur.
const g = globalThis as unknown as { __aioBus?: EventEmitter };

export function getBus(): EventEmitter {
  if (!g.__aioBus) {
    g.__aioBus = new EventEmitter();
    g.__aioBus.setMaxListeners(200);
  }
  return g.__aioBus;
}

export const publish = (m: BusMessage) => getBus().emit("msg", m);
