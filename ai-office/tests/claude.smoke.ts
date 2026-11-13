// Elle çalıştırılır: npm run test:claude-smoke
// Geçersiz anahtarla SDK'nın başladığını ve hatanın "entegrasyon gerekli" olarak sınıflandığını doğrular (API harcaması yapmaz).
import { expect, it } from "vitest";
import { Store } from "@/server/store";
import { Runner } from "@/server/runner";
import { getConfig } from "@/server/config";
import { claudeAdapter } from "@/server/adapters/claude";

it("geçersiz anahtar: iş başarısız olur, sahte rapor yazılmaz", async () => {
  const store = new Store(":memory:");
  const runner = new Runner(store, () => ({ ...getConfig(), anthropicKey: "sk-ant-gecersiz-deneme", maxTurns: 2 }), async () => claudeAdapter, 5);
  const { job } = runner.submit({ agentId: "yacht-data-agent", prompt: "Kaç tekne var?" });
  const done = await runner.wait(job.id);
  console.log(done.status, "|", done.error, "|", store.listEvents(job.id).map((e) => `${e.type}:${JSON.stringify(e.data).slice(0, 120)}`));
  expect(done.status).toBe("failed");
  expect(done.report).toBeNull();
}, 90_000);
