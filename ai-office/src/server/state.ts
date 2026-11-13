import { getConfig, executionMode } from "./config";
import { listAgents } from "./agents";
import { getStore } from "./store";
import { getRunner } from "./runner";
import type { OfficeState } from "@/shared/types";

export function officeState(): OfficeState {
  getRunner(); // yarım kalan işlerin toparlanması ilk istekte tetiklenir
  const c = getConfig();
  const mode = executionMode(c);
  return { mode, model: mode === "claude" ? c.model : null, authRequired: !!c.password, agents: listAgents(), jobs: getStore().listJobs(300) };
}
