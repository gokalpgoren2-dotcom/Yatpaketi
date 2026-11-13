import { guard, json } from "@/server/http";
import { officeState } from "@/server/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return (await guard(req)) ?? json(officeState());
}
