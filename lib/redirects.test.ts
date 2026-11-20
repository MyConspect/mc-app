import assert from "node:assert/strict";
import test from "node:test";
import { TRACK_IDS } from "@/lib/catalog";
import { TRACK_SEGMENT, handbookRedirects } from "./redirects";

test("legacy redirects are registered before the track catch-alls", () => {
  const redirects = handbookRedirects();
  const sources = redirects.map((redirect) => redirect.source);
  const trackCatch = `/:track(${TRACK_SEGMENT})`;
  const topicCatch = `${trackCatch}/:topic`;

  assert.equal(sources.at(-2), trackCatch);
  assert.equal(sources.at(-1), topicCatch);
  assert.equal(sources[0], "/");
  assert.equal(redirects[0]?.permanent, false);

  for (const id of TRACK_IDS) {
    assert.ok(TRACK_SEGMENT.split("|").includes(id), id);
  }

  const topicCatchIndex = sources.indexOf(topicCatch);
  assert.ok(sources.indexOf("/frontend/css-fundamentals") < topicCatchIndex);
  assert.ok(sources.indexOf("/other/system-design") < topicCatchIndex);
  assert.ok(sources.indexOf("/backend/nodejs-runtime") < topicCatchIndex);
  assert.equal(
    redirects.find((redirect) => redirect.source === "/frontend/css-fundamentals")
      ?.destination,
    "/en/frontend/css-core",
  );
  assert.equal(
    redirects.find((redirect) => redirect.source === "/other/system-design")
      ?.destination,
      "/en/computer-science/system-design",
  );
  assert.equal(
    redirects.find((redirect) => redirect.source === "/behavior")?.destination,
    undefined,
  );
  assert.equal(
    redirects.find((redirect) => redirect.source === "/test/test-ts-freshers")
      ?.destination,
    "/en/frontend/ts-interview#gfe-test-typescript",
  );
  assert.equal(
    redirects.find((redirect) => redirect.source === "/test/:path*")?.destination,
    "/en/frontend",
  );
});
