import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { handbookRedirects } from "./lib/redirects";
import { resourcesRoot } from "./lib/resourcesRoot";

const catalogProbe = path.join(resourcesRoot(), "en", "1_html_structure.md");
if (!fs.existsSync(catalogProbe)) {
  throw new Error(
    `Missing study notes at ${catalogProbe} (cwd=${process.cwd()}). ` +
      "Vercel CLI uploads omit gitignored files; resources/en/*.md must be in the deploy.",
  );
}

const tracedBuildOnly = [
  "./resources/**/*",
  "./node_modules/shiki/**/*",
  "./node_modules/@shikijs/**/*",
];

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": tracedBuildOnly,
    "/**": tracedBuildOnly,
  },
  serverExternalPackages: ["sanitize-html", "marked", "shiki"],
  async headers() {
    return [
      {
        source: "/search-index/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [...handbookRedirects()];
  },
};

export default nextConfig;
