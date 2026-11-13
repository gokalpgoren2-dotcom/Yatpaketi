import path from "node:path";

// Tüm ortam değişkenleri yalnızca burada okunur. Bu dosya istemci koduna alınmaz.

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export function getConfig() {
  const e = process.env;
  const appDir = process.cwd();
  return {
    workspace: path.resolve(e.AI_OFFICE_WORKSPACE || path.join(appDir, "..")),
    dataDir: path.resolve(e.AI_OFFICE_DATA_DIR || path.join(appDir, "data")),
    password: e.AI_OFFICE_PASSWORD || "",
    sessionSecret: e.AI_OFFICE_SESSION_SECRET || "",
    anthropicKey: e.ANTHROPIC_API_KEY || "",
    model: e.AI_OFFICE_MODEL || "claude-opus-5-5",
    maxBudgetUsd: num(e.AI_OFFICE_MAX_BUDGET_USD, 2),
    maxTurns: Math.round(num(e.AI_OFFICE_MAX_TURNS, 40)),
    concurrency: Math.round(num(e.AI_OFFICE_CONCURRENCY, 2)),
    meta: {
      token: e.META_ACCESS_TOKEN || "",
      adAccountId: (e.META_AD_ACCOUNT_ID || "").replace(/^act_/, ""),
      graphVersion: e.META_GRAPH_VERSION || "v21.0",
    },
  };
}

export type Config = ReturnType<typeof getConfig>;

export const executionMode = (c: Config = getConfig()) => (c.anthropicKey ? "claude" : "local") as "claude" | "local";
