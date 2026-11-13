import { guard, json, fail } from "@/server/http";
import { getStore } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard(req);
  if (blocked) return blocked;
  const { id } = await params;
  const job = getStore().getJob(id);
  if (!job) return fail(404, "Görev bulunamadı.");
  return json({ job, events: getStore().listEvents(id) });
}
