// İstemci ve sunucunun ortak kullandığı tipler. Buraya sunucuya özel kod konmaz.

export const AGENT_IDS = [
  "master-agent",
  "frontend-agent",
  "backend-agent",
  "seo-agent",
  "competitor-agent",
  "meta-agent",
  "yacht-data-agent",
  "security-qa-agent",
] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export type JobStatus = "queued" | "working" | "approval_required" | "completed" | "failed" | "cancelled";
/** Masada gösterilen durum: aktif iş yoksa "idle". */
export type DeskStatus = "idle" | JobStatus;
/** claude: Claude Agent SDK ile gerçek yürütme. local: LLM'siz, depo üzerinde sabit denetim. */
export type ExecutionMode = "claude" | "local";

export const ACTIVE_STATUSES: JobStatus[] = ["queued", "working", "approval_required"];
export const isActive = (s: JobStatus) => ACTIVE_STATUSES.includes(s);

export interface JobUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  turns: number;
  durationMs: number;
}

export interface PendingApproval {
  id: string;
  tool: string;
  summary: string;
  detail: string;
  requestedAt: number;
}

export interface Job {
  id: string;
  agentId: AgentId;
  prompt: string;
  status: JobStatus;
  mode: ExecutionMode;
  parentId: string | null;
  attempt: number;
  maxAttempts: number;
  report: string | null;
  error: string | null;
  usage: JobUsage | null;
  pendingApproval: PendingApproval | null;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  /** Her güncellemede artar; istemci eski bir kopyanın yenisini ezmesini bununla önler. */
  rev: number;
}

export type JobEventType = "status" | "message" | "tool" | "tool_result" | "approval" | "handoff" | "usage" | "error" | "log";

export interface JobEvent {
  id: number;
  jobId: string;
  ts: number;
  type: JobEventType;
  data: Record<string, unknown>;
}

export interface AgentInfo {
  id: AgentId;
  /** .claude/agents/<id>.md bulundu ve geçerli mi */
  defined: boolean;
  description: string;
  tools: string[];
  /** Bu ajanın gerçek veri için ihtiyaç duyduğu, henüz bağlı olmayan entegrasyonlar */
  missingIntegrations: string[];
}

export interface OfficeState {
  mode: ExecutionMode;
  model: string | null;
  authRequired: boolean;
  agents: AgentInfo[];
  jobs: Job[];
}

export type BusMessage = { kind: "job"; job: Job } | { kind: "event"; event: JobEvent };
