import { randomUUID } from "node:crypto";
import { getStore, type Store, type JobPatch } from "./store";
import { publish } from "./bus";
import { getConfig, executionMode, type Config } from "./config";
import { loadAgent } from "./agents";
import { IntegrationRequiredError, TransientError, type DelegationResult, type ExecutionAdapter, type RunContext } from "./adapters/types";
import { isActive, type AgentId, type ExecutionMode, type Job, type JobEventType } from "@/shared/types";

// Yürütme motoru: kuyruk, eşzamanlılık sınırı, onay bekleme, iptal, yeniden deneme.
// Görsel ofisten bağımsızdır; yalnızca depoya yazar ve yayın kanalına bildirir.

type AdapterLoader = (mode: ExecutionMode) => Promise<ExecutionAdapter>;

const defaultLoader: AdapterLoader = async (mode) =>
  mode === "claude" ? (await import("./adapters/claude")).claudeAdapter : (await import("./adapters/local")).localAdapter;

interface Running {
  abort: AbortController;
  approval?: { id: string; resolve: (ok: boolean) => void };
}

export class Runner {
  private queue: string[] = [];
  private running = new Map<string, Running>();
  private waiters = new Map<string, ((j: Job) => void)[]>();
  private timers = new Set<NodeJS.Timeout>();
  private slots = 0;

  constructor(
    private store: Store,
    private config: () => Config = getConfig,
    private loadAdapter: AdapterLoader = defaultLoader,
    private backoffMs = 2000,
  ) {}

  /** Süreç yeniden başladığında yarım kalan işleri toparlar. */
  recover() {
    for (const j of this.store.listByStatus(["working", "approval_required"])) {
      this.event(j.id, "error", { message: "Sunucu yeniden başlatıldı, görev yarıda kaldı." });
      this.patch(j.id, { status: "failed", error: "Sunucu yeniden başlatıldı; görev yarıda kaldı. Yeniden deneyebilirsiniz.", pendingApproval: null, finishedAt: Date.now() });
    }
    for (const j of this.store.listByStatus(["queued"])) if (!j.parentId) this.queue.push(j.id);
    this.pump();
  }

  submit(input: { agentId: AgentId; prompt: string; idempotencyKey?: string | null }): { job: Job; created: boolean } {
    const res = this.store.createJob({ ...input, mode: executionMode(this.config()) });
    if (res.created) {
      this.event(res.job.id, "status", { status: "queued" });
      publish({ kind: "job", job: res.job });
      this.queue.push(res.job.id);
      this.pump();
    }
    return res;
  }

  cancel(id: string): Job | null {
    const job = this.store.getJob(id);
    if (!job) return null;
    if (!isActive(job.status)) return job;
    const run = this.running.get(id);
    if (run) {
      run.approval?.resolve(false);
      run.abort.abort();
      // Adaptör iptali fark edip dönene kadar durum burada kesinleştirilir.
    }
    this.queue = this.queue.filter((q) => q !== id);
    this.event(id, "status", { status: "cancelled", by: "user" });
    return this.patch(id, { status: "cancelled", pendingApproval: null, finishedAt: Date.now() });
  }

  /** Başarısız ya da iptal edilmiş işi aynı talimatla yeniden kuyruğa alır. */
  retry(id: string): Job | null {
    const job = this.store.getJob(id);
    if (!job) return null;
    if (job.status !== "failed" && job.status !== "cancelled") return job;
    this.event(id, "status", { status: "queued", by: "user-retry" });
    const next = this.patch(id, { status: "queued", error: null, report: null, usage: null, attempt: 0, startedAt: null, finishedAt: null });
    this.queue.push(id);
    this.pump();
    return next;
  }

  resolveApproval(id: string, approvalId: string, approved: boolean): Job | null {
    const job = this.store.getJob(id);
    const run = this.running.get(id);
    if (!job) return null;
    if (!run?.approval || run.approval.id !== approvalId || job.status !== "approval_required") return job;
    const { resolve } = run.approval;
    run.approval = undefined;
    this.event(id, "approval", { approvalId, decision: approved ? "approved" : "rejected" });
    const next = this.patch(id, { status: "working", pendingApproval: null });
    resolve(approved);
    return next;
  }

  /** İş bitene kadar bekler (testler ve yönlendirme için). */
  wait(id: string): Promise<Job> {
    const job = this.store.getJob(id);
    if (job && !isActive(job.status)) return Promise.resolve(job);
    return new Promise((res) => this.waiters.set(id, [...(this.waiters.get(id) ?? []), res]));
  }

  shutdown() {
    for (const t of this.timers) clearTimeout(t);
    for (const r of this.running.values()) r.abort.abort();
  }

  private patch(id: string, p: JobPatch): Job {
    const job = this.store.updateJob(id, p);
    publish({ kind: "job", job });
    if (!isActive(job.status)) {
      const w = this.waiters.get(id);
      if (w) {
        this.waiters.delete(id);
        w.forEach((f) => f(job));
      }
    }
    return job;
  }

  private event(jobId: string, type: JobEventType, data: Record<string, unknown>) {
    publish({ kind: "event", event: this.store.addEvent(jobId, type, data) });
  }

  private pump() {
    while (this.slots < this.config().concurrency && this.queue.length) {
      const id = this.queue.shift()!;
      this.slots += 1;
      void this.execute(id).finally(() => {
        this.slots -= 1;
        this.pump();
      });
    }
  }

  private async execute(id: string): Promise<void> {
    let job = this.store.getJob(id);
    if (!job || job.status !== "queued") return;
    const run: Running = { abort: new AbortController() };
    this.running.set(id, run);
    const stopped = () => run.abort.signal.aborted || this.store.getJob(id)?.status === "cancelled";
    job = this.patch(id, { status: "working", attempt: job.attempt + 1, startedAt: Date.now() });
    this.event(id, "status", { status: "working", attempt: job.attempt, mode: job.mode });

    try {
      const config = this.config();
      const agent = loadAgent(job.agentId, config.workspace);
      if (!agent) throw new IntegrationRequiredError(`Ajan tanımı bulunamadı ya da geçersiz: .claude/agents/${job.agentId}.md`);
      const adapter = await this.loadAdapter(job.mode);
      const ctx: RunContext = {
        job,
        agent,
        config,
        signal: run.abort.signal,
        emit: (type, data) => {
          if (!stopped()) this.event(id, type, data);
        },
        requestApproval: (tool, summary, detail) => this.requestApproval(id, run, tool, summary, detail),
        delegate: (agentId, prompt) => this.delegate(job!, agentId, prompt, run.abort.signal),
      };
      const result = await adapter.run(ctx);
      if (stopped()) return;
      if (result.usage) this.event(id, "usage", { ...result.usage });
      this.event(id, "status", { status: "completed" });
      this.patch(id, { status: "completed", report: result.report, usage: result.usage ?? null, finishedAt: Date.now() });
    } catch (err) {
      // İptal durumunu cancel() zaten yazdı; eski yürütme yeni bir denemenin durumuna dokunmaz.
      if (stopped()) return;
      const message = err instanceof Error ? err.message : String(err);
      const current = this.store.getJob(id)!;
      if (err instanceof TransientError && current.attempt < current.maxAttempts) {
        const delay = this.backoffMs * 2 ** (current.attempt - 1);
        this.event(id, "error", { message, retryInMs: delay, attempt: current.attempt });
        this.patch(id, { status: "queued", error: message, pendingApproval: null });
        const t = setTimeout(() => {
          this.timers.delete(t);
          if (this.store.getJob(id)?.status === "queued") {
            this.queue.push(id);
            this.pump();
          }
        }, delay);
        this.timers.add(t);
        return;
      }
      this.event(id, "error", { message, integrationRequired: err instanceof IntegrationRequiredError });
      this.patch(id, { status: "failed", error: message, pendingApproval: null, finishedAt: Date.now() });
    } finally {
      if (this.running.get(id) === run) this.running.delete(id);
    }
  }

  private requestApproval(id: string, run: Running, tool: string, summary: string, detail: string): Promise<boolean> {
    if (run.abort.signal.aborted) return Promise.resolve(false);
    const approvalId = randomUUID();
    return new Promise<boolean>((resolve) => {
      run.approval = { id: approvalId, resolve };
      this.event(id, "approval", { approvalId, tool, summary, decision: "pending" });
      this.patch(id, { status: "approval_required", pendingApproval: { id: approvalId, tool, summary, detail: detail.slice(0, 6000), requestedAt: Date.now() } });
    });
  }

  /** Alt görev kuyruğa girmez, hemen yürür: üst görev zaten bir yuva tutuyor. Derinlik 1 ile sınırlıdır. */
  private async delegate(parent: Job, agentId: AgentId, prompt: string, signal: AbortSignal): Promise<DelegationResult> {
    if (parent.agentId !== "master-agent" || parent.parentId) throw new Error("Yalnızca master-agent görev yönlendirebilir.");
    if (agentId === "master-agent") throw new Error("master-agent kendine görev yönlendiremez.");
    const { job: child } = this.store.createJob({ agentId, prompt, mode: parent.mode, parentId: parent.id });
    publish({ kind: "job", job: child });
    this.event(child.id, "status", { status: "queued", delegatedBy: parent.id });
    this.event(parent.id, "handoff", { to: agentId, childJobId: child.id, prompt });
    const onAbort = () => void this.cancel(child.id);
    signal.addEventListener("abort", onAbort, { once: true });
    try {
      await this.execute(child.id);
      const done = await this.wait(child.id);
      this.event(parent.id, "handoff", { from: agentId, childJobId: child.id, status: done.status });
      return { jobId: done.id, agentId, status: done.status, report: done.report, error: done.error };
    } finally {
      signal.removeEventListener("abort", onAbort);
    }
  }
}

const g = globalThis as unknown as { __aioRunner?: Runner };
export function getRunner(): Runner {
  if (!g.__aioRunner) {
    g.__aioRunner = new Runner(getStore());
    g.__aioRunner.recover();
  }
  return g.__aioRunner;
}
