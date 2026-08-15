import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: { reporter: ["text", "html"], thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 } },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
