import { execFileSync } from "node:child_process";
import fs from "node:fs";

const DEFAULT_RESOURCES_GIT_HTTPS =
  "https://github.com/MyConspect/mc-content.git";
const DEFAULT_RESOURCES_GIT_SSH =
  "git@github.com:MyConspect/mc-content.git";

function defaultResourcesGitUrl(): string {
  if (process.env.GIT_SSH_COMMAND?.trim()) {
    return DEFAULT_RESOURCES_GIT_SSH;
  }
  return DEFAULT_RESOURCES_GIT_HTTPS;
}

function authenticatedCloneUrl(url: string, token: string | undefined): string {
  if (url.startsWith("git@")) return url;
  if (!token) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return url;
    parsed.username = "x-access-token";
    parsed.password = token;
    return parsed.toString();
  } catch {
    return url;
  }
}

function repoLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname}${pathname.replace(/\/$/, "")}`;
  } catch {
    return "(invalid RESOURCES_GIT_URL)";
  }
}

const ref = (process.env.RESOURCES_GIT_REF?.trim() || "main").trim();
const url = (
  process.env.RESOURCES_GIT_URL?.trim() || defaultResourcesGitUrl()
).trim();
const token = process.env.RESOURCES_GIT_TOKEN?.trim();

const cloneUrl = authenticatedCloneUrl(url, token);

let sha: string;
if (/^[0-9a-f]{40}$/i.test(ref)) {
  sha = ref.toLowerCase();
} else {
  try {
    const out = execFileSync(
      "git",
      ["ls-remote", cloneUrl, `refs/heads/${ref}`],
      { encoding: "utf8" },
    );
    sha = out.split(/\s+/)[0] ?? "";
  } catch {
    const hasToken = Boolean(token);
    console.error(
      `::error::Could not ls-remote ${repoLabel(url)} for ref "${ref}". ` +
        `Check RESOURCES_GIT_URL, RESOURCES_GIT_REF, and ` +
        (process.env.GIT_SSH_COMMAND?.trim()
          ? "MC_CONTENT_DEPLOY_KEY and deploy key on mc-content."
          : hasToken
            ? "RESOURCES_GIT_TOKEN (repo read on mc-content)."
            : "MC_CONTENT_DEPLOY_KEY or RESOURCES_GIT_TOKEN."),
    );
    process.exit(1);
  }
}

if (!sha) {
  console.error(
    `::error::Could not resolve mc-content revision for ref "${ref}" at ${repoLabel(url)}`,
  );
  process.exit(1);
}

const githubOutput = process.env.GITHUB_OUTPUT;
const githubEnv = process.env.GITHUB_ENV;
if (!githubOutput || !githubEnv) {
  throw new Error("GITHUB_OUTPUT and GITHUB_ENV are required");
}

fs.appendFileSync(githubOutput, `sha=${sha}\n`);
fs.appendFileSync(githubEnv, `CONTENT_REVISION=${sha}\n`);