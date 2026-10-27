// Guards for the Cloudflare setup. Both mistakes below would pass every
// other test and only show up on the live site.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

describe("Cloudflare config", () => {
  it("serves index.html for unknown paths, so /cars/<id> deep links work", () => {
    const wrangler = readFileSync(`${repoRoot}wrangler.jsonc`, "utf8");
    expect(wrangler).toMatch(/"directory":\s*"\.\/web\/dist"/);
    expect(wrangler).toMatch(/"not_found_handling":\s*"single-page-application"/);
  });

  it("caches the data index for minutes, not days", () => {
    const headers = readFileSync(`${repoRoot}public/_headers`, "utf8");
    const indexRule = headers.match(/^\/data\/index\.json\n\s+Cache-Control: .*max-age=(\d+)/m);
    expect(indexRule).not.toBeNull();
    expect(Number(indexRule![1])).toBeLessThanOrEqual(3600);
  });
});
