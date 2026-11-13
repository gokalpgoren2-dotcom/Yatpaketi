import type { AgentId, Job, JobEventType, JobUsage } from "@/shared/types";
import type { AgentDefinition } from "../agents";
import type { Config } from "../config";

export interface DelegationResult {
  jobId: string;
  agentId: AgentId;
  status: string;
  report: string | null;
  error: string | null;
}

/** Adaptörün yürütme motorundan aldığı yetenekler. Adaptör depoya ya da yayına doğrudan dokunmaz. */
export interface RunContext {
  job: Job;
  agent: AgentDefinition;
  config: Config;
  signal: AbortSignal;
  emit(type: JobEventType, data: Record<string, unknown>): void;
  /** İşi "onay bekliyor" durumuna alır ve kullanıcının kararını bekler. */
  requestApproval(tool: string, summary: string, detail: string): Promise<boolean>;
  /** Başka bir ajana alt görev açar ve bitmesini bekler (yalnızca master-agent). */
  delegate(agentId: AgentId, prompt: string): Promise<DelegationResult>;
}

export interface RunResult {
  report: string;
  usage?: JobUsage;
}

export interface ExecutionAdapter {
  run(ctx: RunContext): Promise<RunResult>;
}

/** Yeniden denenebilir geçici hata (ağ, hız sınırı, aşırı yük) */
export class TransientError extends Error {}
/** Entegrasyon ya da yapılandırma eksik: yeniden denemek işe yaramaz */
export class IntegrationRequiredError extends Error {}
