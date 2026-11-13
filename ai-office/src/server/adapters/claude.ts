import path from "node:path";
import { query, tool, createSdkMcpServer, type CanUseTool, type HookCallback, type Options } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { APPROVAL_TOOLS, READ_ONLY_TOOLS, isAgentId } from "../agents";
import { IntegrationRequiredError, TransientError, type ExecutionAdapter, type RunContext } from "./types";
import { fetchMetaInsights } from "./meta";
import type { JobUsage } from "@/shared/types";

// Gerçek yürütme: Claude Agent SDK (query). Ajan, sunucuda başlatılan bir alt süreçte çalışır;
// tarayıcıya kabuk ya da dosya erişimi verilmez. Her araç çağrısı aşağıdaki kapıdan geçer.

const OFFICE_RULES = `
## AI Office çalışma kuralları

- Bu görev Yatpaketi AI Office üzerinden verildi. Yanıtını Türkçe yaz.
- Dosya değiştiren ve komut çalıştıran her araç çağrısı kullanıcıya onaya gider. Reddedilirse ısrar etme; yapılamayanı raporda belirt.
- Production deploy, yayınlama, reklam harcaması, e-posta gönderimi, veri silme yapamazsın.
- Erişemediğin veri için rakam ya da sonuç uydurma. Eksik kalan her şeyi açıkça yaz.
- Son mesajın kullanıcıya gösterilecek rapordur: Markdown, kısa ve somut.`;

const SECRET_PATH = /(^|[\\/])\.env(\.|$)|(^|[\\/])\.git([\\/]|$)|\.pem$|id_rsa|credentials/i;

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Araç girdisinden kullanıcıya gösterilecek kısa özet ve ayrıntı üretir. */
export function describeTool(toolName: string, input: Record<string, unknown>): { summary: string; detail: string } {
  if (toolName === "Bash") return { summary: `Komut çalıştır: ${str(input.command).slice(0, 160)}`, detail: str(input.command) };
  if (toolName === "Write") return { summary: `Dosya yaz: ${str(input.file_path)}`, detail: str(input.content) };
  if (toolName === "Edit")
    return { summary: `Dosya düzenle: ${str(input.file_path)}`, detail: `--- eski\n${str(input.old_string)}\n+++ yeni\n${str(input.new_string)}` };
  const target = str(input.file_path) || str(input.path) || str(input.pattern) || str(input.url) || str(input.query);
  return { summary: `${toolName}${target ? `: ${target.slice(0, 200)}` : ""}`, detail: JSON.stringify(input, null, 2) };
}

/** Yol depo kökünün içinde mi ve gizli dosya değil mi */
export function pathAllowed(workspace: string, p: string): boolean {
  if (!p) return true;
  const abs = path.resolve(workspace, p);
  const rel = path.relative(workspace, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return false;
  return !SECRET_PATH.test(rel);
}

export type Gate = "allow" | "ask" | "deny";

/** En az ayrıcalık: araç ajanın tanımında yoksa reddedilir; yazma ve komut her zaman onaya gider. */
export function gateTool(agentTools: string[], workspace: string, toolName: string, input: Record<string, unknown>): { gate: Gate; reason?: string } {
  if (toolName.startsWith("mcp__office__")) return { gate: "allow" };
  if (!agentTools.includes(toolName)) return { gate: "deny", reason: `${toolName} aracı bu ajanın yetkileri arasında değil.` };
  const p = str(input.file_path) || str(input.path);
  if (p && !pathAllowed(workspace, p)) return { gate: "deny", reason: "Depo dışındaki ya da gizli dosyalara erişim yasak." };
  if (toolName === "Bash" && /\.env\b/.test(str(input.command))) return { gate: "deny", reason: "Ortam dosyalarına komutla erişim yasak." };
  if (READ_ONLY_TOOLS.includes(toolName)) return { gate: "allow" };
  if (APPROVAL_TOOLS.includes(toolName)) return { gate: "ask" };
  return { gate: "deny", reason: "Bilinmeyen araç." };
}

/** Alt sürece yalnızca gereken değişkenler geçer; Meta token'ı ve ofis parolası geçmez. */
function childEnv(apiKey: string): Record<string, string | undefined> {
  const keep = ["PATH", "HOME", "LANG", "LC_ALL", "TMPDIR", "TEMP", "TMP", "USER", "SHELL", "SystemRoot", "HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY", "https_proxy", "http_proxy", "no_proxy", "NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "ANTHROPIC_BASE_URL"];
  const env: Record<string, string | undefined> = { ANTHROPIC_API_KEY: apiKey };
  for (const k of keep) if (process.env[k]) env[k] = process.env[k];
  return env;
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

function officeTools(ctx: RunContext) {
  const tools = [];
  if (ctx.job.agentId === "master-agent" && !ctx.job.parentId) {
    tools.push(
      tool(
        "delegate_task",
        "Bir uzman ajana alt görev verir, bitmesini bekler ve raporunu döndürür. agent: frontend-agent, backend-agent, seo-agent, competitor-agent, meta-agent, yacht-data-agent, security-qa-agent.",
        { agent: z.string(), instruction: z.string().min(10) },
        async (args) => {
          if (!isAgentId(args.agent) || args.agent === "master-agent") return text(`Geçersiz ajan: ${args.agent}`);
          const r = await ctx.delegate(args.agent, args.instruction);
          return text(`Alt görev ${r.jobId} durumu: ${r.status}\n\n${r.report ?? r.error ?? "(rapor yok)"}`);
        },
      ),
    );
  }
  if (ctx.job.agentId === "meta-agent" && ctx.config.meta.token && ctx.config.meta.adAccountId) {
    tools.push(
      tool(
        "meta_insights",
        "Yatpaketi Meta reklam hesabının gerçek performans verisini salt okunur olarak getirir (kampanya düzeyi).",
        { date_preset: z.enum(["last_7d", "last_14d", "last_30d", "last_90d", "this_month", "last_month"]) },
        async (args) => {
          try {
            return text(JSON.stringify(await fetchMetaInsights(ctx.config.meta, args.date_preset, ctx.signal)));
          } catch (e) {
            return text(`Meta verisi alınamadı: ${e instanceof Error ? e.message : String(e)}`);
          }
        },
      ),
    );
  }
  return tools;
}

const TRANSIENT = /rate.?limit|overloaded|\b(429|500|502|503|529)\b|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|fetch failed|timeout/i;

export const claudeAdapter: ExecutionAdapter = {
  async run(ctx) {
    const { config, agent, job } = ctx;
    if (!config.anthropicKey) throw new IntegrationRequiredError("ANTHROPIC_API_KEY tanımlı değil; gerçek mod kullanılamıyor.");

    const abort = new AbortController();
    const onAbort = () => abort.abort();
    ctx.signal.addEventListener("abort", onAbort, { once: true });

    // 1. kapı: her araç çağrısı kaydedilir; yetkisizler reddedilir, yazma ve komut onaya düşer.
    const preToolUse: HookCallback = async (input) => {
      if (input.hook_event_name !== "PreToolUse") return {};
      const toolInput = (input.tool_input ?? {}) as Record<string, unknown>;
      const { gate, reason } = gateTool(agent.tools, config.workspace, input.tool_name, toolInput);
      ctx.emit("tool", { tool: input.tool_name, summary: describeTool(input.tool_name, toolInput).summary, gate });
      return {
        hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: gate, ...(reason ? { permissionDecisionReason: reason } : {}) },
      };
    };
    const postToolUseFailure: HookCallback = async (input) => {
      if (input.hook_event_name === "PostToolUseFailure") ctx.emit("tool_result", { tool: input.tool_name, ok: false, error: String(input.error ?? "").slice(0, 500) });
      return {};
    };

    // 2. kapı: onay gereken çağrılar burada kullanıcının kararını bekler (süre sınırı yok).
    const canUseTool: CanUseTool = async (toolName, input) => {
      const { gate, reason } = gateTool(agent.tools, config.workspace, toolName, input);
      if (gate === "allow") return { behavior: "allow", updatedInput: input };
      if (gate === "deny") return { behavior: "deny", message: reason ?? "Reddedildi." };
      const d = describeTool(toolName, input);
      const ok = await ctx.requestApproval(toolName, d.summary, d.detail);
      return ok ? { behavior: "allow", updatedInput: input } : { behavior: "deny", message: "Kullanıcı bu işlemi onaylamadı." };
    };

    const mcpTools = officeTools(ctx);
    const options: Options = {
      cwd: config.workspace,
      model: config.model,
      systemPrompt: `${agent.prompt}\n${OFFICE_RULES}`,
      tools: agent.tools,
      allowedTools: mcpTools.map((t) => `mcp__office__${t.name}`),
      mcpServers: mcpTools.length ? { office: createSdkMcpServer({ name: "office", version: "1.0.0", tools: mcpTools }) } : {},
      strictMcpConfig: true,
      // Depodaki ya da kullanıcıdaki Claude ayarları, kancaları ve izinleri yüklenmez.
      settingSources: [],
      permissionMode: "default",
      canUseTool,
      hooks: { PreToolUse: [{ hooks: [preToolUse] }], PostToolUseFailure: [{ hooks: [postToolUseFailure] }] },
      abortController: abort,
      maxTurns: config.maxTurns,
      maxBudgetUsd: config.maxBudgetUsd,
      persistSession: false,
      env: childEnv(config.anthropicKey),
    };

    let report = "";
    let lastText = "";
    let usage: JobUsage | undefined;
    let apiError: string | undefined;
    try {
      for await (const msg of query({ prompt: job.prompt, options })) {
        if (msg.type === "assistant" && !msg.parent_tool_use_id) {
          if (msg.error) {
            // API hatası: metin bir rapor değil hata iletisidir, sohbete rapor gibi yazılmaz.
            apiError = msg.error;
            continue;
          }
          for (const block of msg.message.content) {
            if (block.type === "text" && block.text.trim()) {
              lastText = block.text;
              ctx.emit("message", { text: block.text });
            }
          }
        } else if (msg.type === "result") {
          let inputTokens = 0;
          let outputTokens = 0;
          for (const u of Object.values(msg.modelUsage ?? {})) {
            inputTokens += u.inputTokens + u.cacheReadInputTokens + u.cacheCreationInputTokens;
            outputTokens += u.outputTokens;
          }
          usage = { inputTokens, outputTokens, costUsd: msg.total_cost_usd, turns: msg.num_turns, durationMs: msg.duration_ms };
          if (apiError) {
            ctx.emit("usage", { ...usage });
            if (apiError === "authentication_failed" || apiError === "billing_error")
              throw new IntegrationRequiredError(
                apiError === "billing_error" ? "Anthropic hesabında bakiye ya da faturalama sorunu var." : "Anthropic API anahtarı reddedildi. ANTHROPIC_API_KEY değerini kontrol edin.",
              );
            if (apiError === "rate_limit" || apiError === "server_error" || apiError === "overloaded") throw new TransientError(`Anthropic API geçici hatası: ${apiError}`);
            throw new Error(`Model hatası: ${apiError}`);
          }
          if (msg.subtype === "success" && !msg.is_error) {
            report = msg.result || lastText;
          } else {
            ctx.emit("usage", { ...usage });
            const why =
              msg.subtype === "error_max_turns"
                ? `Tur sınırına ulaşıldı (${config.maxTurns}).`
                : msg.subtype === "error_max_budget_usd"
                  ? `Harcama tavanına ulaşıldı (${config.maxBudgetUsd} USD).`
                  : `Yürütme hatası (${msg.subtype}).`;
            const detail = "errors" in msg && Array.isArray(msg.errors) ? msg.errors.join("; ").slice(0, 500) : "";
            const full = `${why} ${detail}`.trim();
            if (TRANSIENT.test(detail)) throw new TransientError(full);
            throw new Error(full);
          }
        }
      }
    } catch (e) {
      if (e instanceof TransientError || e instanceof IntegrationRequiredError) throw e;
      const m = e instanceof Error ? e.message : String(e);
      if (/authentication|invalid.*api.?key|401/i.test(m)) throw new IntegrationRequiredError("Anthropic API anahtarı reddedildi. ANTHROPIC_API_KEY değerini kontrol edin.");
      if (TRANSIENT.test(m)) throw new TransientError(m);
      throw e;
    } finally {
      ctx.signal.removeEventListener("abort", onAbort);
    }
    if (!report.trim()) throw new Error("Ajan rapor üretmeden durdu.");
    return { report, usage };
  },
};
