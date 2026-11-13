import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: { environment: "node", include: [process.env.AIO_SMOKE ? "tests/**/*.smoke.ts" : "tests/**/*.test.ts"], fileParallelism: false },
});
