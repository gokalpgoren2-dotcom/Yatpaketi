import fs from "node:fs";
import path from "node:path";
import { AGENT_IDS, type AgentId, type AgentInfo } from "@/shared/types";
import { getConfig, executionMode, type Config } from "./config";

// Ajan tanımlarının tek kaynağı depo kökündeki .claude/agents/<id>.md dosyalarıdır.
// Aynı dosyaları Claude Code da alt ajan olarak kullanır; ofis ayrıca bir kopya tutmaz.

export interface AgentDefinition {
  id: AgentId;
  description: string;
  tools: string[];
  prompt: string;
}

/** Ofisin tanıdığı yerleşik araçlar. Tanım dosyasında başka bir araç yazsa bile verilmez. */
export const READ_ONLY_TOOLS = ["Read", "Glob", "Grep", "WebSearch", "WebFetch"];
export const APPROVAL_TOOLS = ["Edit", "Write", "Bash"];
const KNOWN_TOOLS = new Set([...READ_ONLY_TOOLS, ...APPROVAL_TOOLS]);

export function parseAgentFile(text: string): { meta: Record<string, string>; body: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[kv[1]] = v;
  }
  return { meta, body: m[2].trim() };
}

export function loadAgent(id: AgentId, workspace = getConfig().workspace): AgentDefinition | null {
  let text: string;
  try {
    text = fs.readFileSync(path.join(workspace, ".claude", "agents", `${id}.md`), "utf8");
  } catch {
    return null;
  }
  const parsed = parseAgentFile(text);
  if (!parsed || parsed.meta.name !== id || !parsed.meta.description || !parsed.body) return null;
  const tools = (parsed.meta.tools || "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => KNOWN_TOOLS.has(t));
  return { id, description: parsed.meta.description, tools, prompt: parsed.body };
}

export function missingIntegrations(id: AgentId, c: Config = getConfig()): string[] {
  const out: string[] = [];
  const local = executionMode(c) === "local";
  if (local && (id === "competitor-agent" || id === "meta-agent")) out.push("Claude API (ANTHROPIC_API_KEY)");
  if (id === "meta-agent" && !(c.meta.token && c.meta.adAccountId)) out.push("Meta Marketing API (META_ACCESS_TOKEN, META_AD_ACCOUNT_ID)");
  return out;
}

export function listAgents(): AgentInfo[] {
  const c = getConfig();
  return AGENT_IDS.map((id) => {
    const def = loadAgent(id, c.workspace);
    return { id, defined: !!def, description: def?.description ?? "", tools: def?.tools ?? [], missingIntegrations: missingIntegrations(id, c) };
  });
}

export const isAgentId = (v: unknown): v is AgentId => typeof v === "string" && (AGENT_IDS as readonly string[]).includes(v);
