import { guard, json, fail, readJson } from "@/server/http";
import { getRunner } from "@/server/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  const { id } = await params;
  const body = await readJson(req);
  if (typeof body?.approvalId !== "string" || typeof body.approved !== "boolean") return fail(400, "approvalId ve approved gerekli.");
  const job = getRunner().resolveApproval(id, body.approvalId, body.approved);
  return job ? json({ job }) : fail(404, "Görev bulunamadı.");
}
