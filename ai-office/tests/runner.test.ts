import { describe, expect, it } from "vitest";
import { Store } from "@/server/store";
import { Runner } from "@/server/runner";
import { getConfig } from "@/server/config";
import { localAdapter } from "@/server/adapters/local";
import { IntegrationRequiredError, TransientError, type ExecutionAdapter } from "@/server/adapters/types";

const config = () => ({ ...getConfig(), anthropicKey: "", concurrency: 2 });
const make = (adapter: ExecutionAdapter) => {
  const store = new Store(":memory:");
  return { store, runner: new Runner(store, config, async () => adapter, 5) };
};
const tick = (ms = 15) => new Promise((r) => setTimeout(r, ms));

describe("yürütme motoru", () => {
  it("işi tamamlar, raporu ve kullanımı kaydeder", async () => {
    const { store, runner } = make({ run: async (ctx) => (ctx.emit("tool", { summary: "adım" }), { report: "# Rapor", usage: { inputTokens: 1, outputTokens: 2, costUsd: 0.01, turns: 1, durationMs: 5 } }) });
    const { job } = runner.submit({ agentId: "seo-agent", prompt: "denetle" });
    const done = await runner.wait(job.id);
    expect(done.status).toBe("completed");
    expect(done.report).toBe("# Rapor");
    expect(done.usage?.costUsd).toBe(0.01);
    expect(store.listEvents(job.id).map((e) => e.type)).toEqual(["status", "status", "tool", "usage", "status"]);
  });

  it("onay gerektiren adımda bekler; onay ve ret adaptöre iletilir", async () => {
    const seen: boolean[] = [];
    const { runner, store } = make({
      run: async (ctx) => {
        seen.push(await ctx.requestApproval("Edit", "Dosya düzenle: a.ts", "fark"));
        return { report: "bitti" };
      },
    });
    for (const decision of [true, false]) {
      const { job } = runner.submit({ agentId: "frontend-agent", prompt: "düzenle" });
      await tick();
      const waiting = store.getJob(job.id)!;
      expect(waiting.status).toBe("approval_required");
      expect(waiting.pendingApproval?.tool).toBe("Edit");
      // yanlış onay kimliği hiçbir şeyi değiştirmez
      expect(runner.resolveApproval(job.id, "yanlis", true)?.status).toBe("approval_required");
      runner.resolveApproval(job.id, waiting.pendingApproval!.id, decision);
      const done = await runner.wait(job.id);
      expect(done.status).toBe("completed");
      expect(done.pendingApproval).toBeNull();
    }
    expect(seen).toEqual([true, false]);
  });

  it("iptal: çalışan iş durur, rapor yazılmaz, yeniden denenebilir", async () => {
    let runs = 0;
    const { runner, store } = make({
      run: (ctx) =>
        new Promise((resolve, reject) => {
          runs += 1;
          if (runs === 2) return resolve({ report: "ikinci deneme" });
          ctx.signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    });
    const { job } = runner.submit({ agentId: "backend-agent", prompt: "uzun iş" });
    await tick();
    expect(store.getJob(job.id)!.status).toBe("working");
    expect(runner.cancel(job.id)?.status).toBe("cancelled");
    await tick();
    expect(store.getJob(job.id)!.status).toBe("cancelled");
    expect(store.getJob(job.id)!.report).toBeNull();
    runner.retry(job.id);
    expect((await runner.wait(job.id)).report).toBe("ikinci deneme");
  });

  it("geçici hatada kendiliğinden yeniden dener, sınırı aşınca başarısız olur", async () => {
    let n = 0;
    const ok = make({ run: async () => (++n < 3 ? Promise.reject(new TransientError("429 rate limit")) : { report: "üçüncüde oldu" }) });
    const a = ok.runner.submit({ agentId: "seo-agent", prompt: "dene" }).job;
    await tick(80);
    const done = ok.store.getJob(a.id)!;
    expect(done.status).toBe("completed");
    expect(done.attempt).toBe(3);

    const bad = make({ run: async () => Promise.reject(new TransientError("overloaded")) });
    const b = bad.runner.submit({ agentId: "seo-agent", prompt: "dene" }).job;
    await tick(80);
    expect(bad.store.getJob(b.id)!.status).toBe("failed");
    expect(bad.store.getJob(b.id)!.attempt).toBe(3);
  });

  it("entegrasyon eksikse yeniden denemeden başarısız olur", async () => {
    let n = 0;
    const { runner } = make({ run: async () => (n++, Promise.reject(new IntegrationRequiredError("anahtar yok"))) });
    const done = await runner.wait(runner.submit({ agentId: "meta-agent", prompt: "rapor" }).job.id);
    expect(done.status).toBe("failed");
    expect(done.error).toBe("anahtar yok");
    expect(n).toBe(1);
  });

  it("yeniden başlatmada yarım kalan işi başarısız işaretler, sıradakini yürütür", async () => {
    const store = new Store(":memory:");
    const stuck = store.createJob({ agentId: "seo-agent", prompt: "yarım", mode: "local" }).job;
    store.updateJob(stuck.id, { status: "working" });
    const queued = store.createJob({ agentId: "seo-agent", prompt: "sırada", mode: "local" }).job;
    const runner = new Runner(store, config, async () => ({ run: async () => ({ report: "ok" }) }), 5);
    runner.recover();
    expect(store.getJob(stuck.id)!.status).toBe("failed");
    expect((await runner.wait(queued.id)).status).toBe("completed");
  });

  it("eşzamanlılık sınırını aşmaz", async () => {
    let live = 0;
    let peak = 0;
    const { runner } = make({
      run: async () => {
        peak = Math.max(peak, ++live);
        await tick(10);
        live -= 1;
        return { report: "ok" };
      },
    });
    const ids = [1, 2, 3, 4, 5].map((i) => runner.submit({ agentId: "seo-agent", prompt: `iş ${i}` }).job.id);
    await Promise.all(ids.map((id) => runner.wait(id)));
    expect(peak).toBe(2);
  });
});

describe("yerel mod (gerçek depo üzerinde)", () => {
  it("tekne verisi denetimi gerçek dosyadan rapor üretir", async () => {
    const { runner } = make(localAdapter);
    const done = await runner.wait(runner.submit({ agentId: "yacht-data-agent", prompt: "ilanları denetle" }).job.id);
    expect(done.status).toBe("completed");
    expect(done.report).toContain("Yerel mod raporu");
    expect(done.report).toMatch(/\d+ tekne incelendi/);
    expect(done.usage?.costUsd).toBe(0);
  });

  it("rakip ve Meta masaları sahte rapor üretmez, entegrasyon ister", async () => {
    const { runner } = make(localAdapter);
    for (const agentId of ["competitor-agent", "meta-agent"] as const) {
      const done = await runner.wait(runner.submit({ agentId, prompt: "rapor hazırla" }).job.id);
      expect(done.status).toBe("failed");
      expect(done.report).toBeNull();
    }
  });

  it("yönetici görevi uzmanlara yönlendirir ve raporları birleştirir", async () => {
    const { runner, store } = make(localAdapter);
    const { job } = runner.submit({ agentId: "master-agent", prompt: "Tekne verisi ve SEO durumunu kontrol ettir" });
    const done = await runner.wait(job.id);
    expect(done.status).toBe("completed");
    const children = store.listJobs().filter((j) => j.parentId === job.id);
    expect(children.map((c) => c.agentId).sort()).toEqual(["seo-agent", "yacht-data-agent"]);
    expect(children.every((c) => c.status === "completed")).toBe(true);
    expect(store.listEvents(job.id).filter((e) => e.type === "handoff")).toHaveLength(4);
    expect(done.report).toContain("## yacht-data-agent");
  });

  it("yönetici dışındaki ajan görev yönlendiremez", async () => {
    const { runner } = make({ run: async (ctx) => (await ctx.delegate("seo-agent", "yap"), { report: "x" }) });
    const done = await runner.wait(runner.submit({ agentId: "frontend-agent", prompt: "devret" }).job.id);
    expect(done.status).toBe("failed");
  });
});
