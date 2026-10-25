import { defineConfig } from "vitest/config";

// One test run covers both the pipeline and the site's data logic.
// Browser flows live in web/e2e and run under Playwright instead.
export default defineConfig({
  test: {
    include: ["pipeline/**/*.test.ts", "web/src/**/*.test.ts", "shared/**/*.test.ts"],
  },
});
