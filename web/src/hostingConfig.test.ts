// Guards for the Cloudflare Pages setup. Both mistakes below would pass every
// other test and only show up on the live site.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));

describe("Cloudflare Pages config", () => {
  it("has no top-level 404.html, which would switch off the single-page app fallback", () => {
    // Pages serves index.html for unknown paths (so /cars/<id> deep links
    // work) only while the site has no 404.html at its root.
    expect(existsSync(`${publicDir}404.html`)).toBe(false);
  });

  it("caches the data index for minutes, not days", () => {
    const headers = readFileSync(`${publicDir}_headers`, "utf8");
    const indexRule = headers.match(/^\/data\/index\.json\n\s+Cache-Control: .*max-age=(\d+)/m);
    expect(indexRule).not.toBeNull();
    expect(Number(indexRule![1])).toBeLessThanOrEqual(3600);
  });
});
