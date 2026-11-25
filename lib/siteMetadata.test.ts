import assert from "node:assert/strict";
import test from "node:test";

import { buildRootMetadata } from "./siteMetadata";

test("buildRootMetadata includes Open Graph image for link previews", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://myconspect.vercel.app";
  try {
    const meta = buildRootMetadata();
    assert.ok(meta.metadataBase instanceof URL);
    assert.equal(meta.metadataBase.href, "https://myconspect.vercel.app/");
    const images = meta.openGraph?.images;
    assert.ok(images);
    const first = Array.isArray(images) ? images[0] : images;
    assert.ok(first && typeof first === "object" && "url" in first);
    assert.equal(String(first.url), "/og-image.png");
  } finally {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  }
});