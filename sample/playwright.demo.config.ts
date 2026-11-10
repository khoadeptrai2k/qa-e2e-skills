import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Presentation-only recording of the existing BK-01 test, with real services.
export default defineConfig(base, {
  grep: /BK-01\b/,
  timeout: 60_000,
  outputDir: "./test-results/demo",
  use: {
    launchOptions: { slowMo: 800 },
    video: {
      mode: "on",
      size: { width: 1000, height: 720 },
      show: {
        actions: { duration: 1200, position: "bottom-left", fontSize: 16 },
        test: { level: "step", position: "bottom-right", fontSize: 14 },
      },
    },
  },
  projects: base.projects!.map((project) => ({
    ...project,
    use: { ...project.use, viewport: { width: 1000, height: 720 } },
  })),
});
