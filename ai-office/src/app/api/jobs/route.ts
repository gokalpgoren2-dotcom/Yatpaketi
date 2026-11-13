import { guard, json, fail, readJson } from "@/server/http";
import { isAgentId } from "@/server/agents";
import { getRunner } from "@/server/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  const body = await readJson(req);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!body || !isAgentId(body.agentId)) return fail(400, "Geçersiz ajan.");
  if (prompt.length < 3 || prompt.length > 8000) return fail(400, "Görev metni 3 ile 8000 karakter arasında olmalı.");
  const key = req.headers.get("idempotency-key");
  if (key && !/^[A-Za-z0-9_-]{8,80}$/.test(key)) return fail(400, "Geçersiz Idempotency-Key.");
  const { job, created } = getRunner().submit({ agentId: body.agentId, prompt, idempotencyKey: key });
  return json({ job, created }, created ? 201 : 200);
}
