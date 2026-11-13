import { guard, json, fail } from "@/server/http";
import { getRunner } from "@/server/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard(req, true);
  if (blocked) return blocked;
  const { id } = await params;
  const job = getRunner().cancel(id);
  return job ? json({ job }) : fail(404, "Görev bulunamadı.");
}
