import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getConfig } from "./config";
import type { AgentId, ExecutionMode, Job, JobEvent, JobEventType, JobStatus, JobUsage, PendingApproval } from "@/shared/types";

// Kalıcı görev kaydı (SQLite). Site veritabanından (Supabase) tamamen ayrıdır.

const SCHEMA = `
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  mode TEXT NOT NULL,
  parent_id TEXT,
  attempt INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  idempotency_key TEXT UNIQUE,
  report TEXT,
  error TEXT,
  usage TEXT,
  pending_approval TEXT,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  finished_at INTEGER,
  rev INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS jobs_agent ON jobs(agent_id, created_at);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status);
CREATE TABLE IF NOT EXISTS job_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  type TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_job ON job_events(job_id, id);
`;

type Row = Record<string, unknown>;

const parse = <T>(v: unknown): T | null => (typeof v === "string" && v ? (JSON.parse(v) as T) : null);

const toJob = (r: Row): Job => ({
  id: r.id as string,
  agentId: r.agent_id as AgentId,
  prompt: r.prompt as string,
  status: r.status as JobStatus,
  mode: r.mode as ExecutionMode,
  parentId: (r.parent_id as string) ?? null,
  attempt: r.attempt as number,
  maxAttempts: r.max_attempts as number,
  report: (r.report as string) ?? null,
  error: (r.error as string) ?? null,
  usage: parse<JobUsage>(r.usage),
  pendingApproval: parse<PendingApproval>(r.pending_approval),
  createdAt: r.created_at as number,
  startedAt: (r.started_at as number) ?? null,
  finishedAt: (r.finished_at as number) ?? null,
  rev: r.rev as number,
});

const toEvent = (r: Row): JobEvent => ({
  id: r.id as number,
  jobId: r.job_id as string,
  ts: r.ts as number,
  type: r.type as JobEventType,
  data: JSON.parse(r.data as string),
});

export interface NewJob {
  agentId: AgentId;
  prompt: string;
  mode: ExecutionMode;
  parentId?: string | null;
  idempotencyKey?: string | null;
  maxAttempts?: number;
}

export type JobPatch = Partial<Pick<Job, "status" | "report" | "error" | "usage" | "pendingApproval" | "attempt" | "startedAt" | "finishedAt">>;

const COLS: Record<keyof JobPatch, string> = {
  status: "status",
  report: "report",
  error: "error",
  usage: "usage",
  pendingApproval: "pending_approval",
  attempt: "attempt",
  startedAt: "started_at",
  finishedAt: "finished_at",
};

export class Store {
  private db: Database.Database;

  constructor(file: string) {
    if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new Database(file);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(SCHEMA);
  }

  /** Aynı idempotency anahtarıyla ikinci istek yeni iş açmaz, var olanı döndürür. */
  createJob(input: NewJob): { job: Job; created: boolean } {
    if (input.idempotencyKey) {
      const existing = this.db.prepare("SELECT * FROM jobs WHERE idempotency_key = ?").get(input.idempotencyKey) as Row | undefined;
      if (existing) return { job: toJob(existing), created: false };
    }
    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO jobs (id, agent_id, prompt, status, mode, parent_id, max_attempts, idempotency_key, created_at)
         VALUES (?, ?, ?, 'queued', ?, ?, ?, ?, ?)`,
      )
      .run(id, input.agentId, input.prompt, input.mode, input.parentId ?? null, input.maxAttempts ?? 3, input.idempotencyKey ?? null, Date.now());
    return { job: this.getJob(id)!, created: true };
  }

  getJob(id: string): Job | null {
    const r = this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as Row | undefined;
    return r ? toJob(r) : null;
  }

  listJobs(limit = 200): Job[] {
    return (this.db.prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?").all(limit) as Row[]).map(toJob);
  }

  listByStatus(statuses: JobStatus[]): Job[] {
    const q = statuses.map(() => "?").join(",");
    return (this.db.prepare(`SELECT * FROM jobs WHERE status IN (${q}) ORDER BY created_at ASC`).all(...statuses) as Row[]).map(toJob);
  }

  updateJob(id: string, patch: JobPatch): Job {
    const keys = Object.keys(patch) as (keyof JobPatch)[];
    if (keys.length) {
      const sets = keys.map((k) => `${COLS[k]} = ?`).join(", ");
      const vals = keys.map((k) => {
        const v = patch[k];
        return v !== null && typeof v === "object" ? JSON.stringify(v) : (v ?? null);
      });
      this.db.prepare(`UPDATE jobs SET ${sets}, rev = rev + 1 WHERE id = ?`).run(...vals, id);
    }
    return this.getJob(id)!;
  }

  addEvent(jobId: string, type: JobEventType, data: Record<string, unknown>): JobEvent {
    const ts = Date.now();
    const info = this.db.prepare("INSERT INTO job_events (job_id, ts, type, data) VALUES (?, ?, ?, ?)").run(jobId, ts, type, JSON.stringify(data));
    return { id: Number(info.lastInsertRowid), jobId, ts, type, data };
  }

  listEvents(jobId: string, afterId = 0): JobEvent[] {
    return (this.db.prepare("SELECT * FROM job_events WHERE job_id = ? AND id > ? ORDER BY id ASC").all(jobId, afterId) as Row[]).map(toEvent);
  }

  close() {
    this.db.close();
  }
}

const g = globalThis as unknown as { __aioStore?: Store };
export function getStore(): Store {
  g.__aioStore ??= new Store(path.join(getConfig().dataDir, "ai-office.db"));
  return g.__aioStore;
}
