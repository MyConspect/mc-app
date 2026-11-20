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

function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  if (url.startsWith("git@github.com:")) {
    const slug = url.slice("git@github.com:".length).replace(/\.git$/, "");
    const [owner, repo] = slug.split("/");
    return owner && repo ? { owner, repo } : null;
  }
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname
      .replace(/^\//, "")
      .replace(/\.git$/, "")
      .split("/");
    const [owner, repo] = parts;
    return owner && repo ? { owner, repo } : null;
  } catch {
    return null;
  }
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
    return url.startsWith("git@") ? url : "(invalid RESOURCES_GIT_URL)";
  }
}

function resolveShaViaGitHubApi(
  owner: string,
  repo: string,
  ref: string,
  token: string,
): string {
  const env = { ...process.env, GH_TOKEN: token, GITHUB_TOKEN: token };
  try {
    return execFileSync(
      "gh",
      ["api", `repos/${owner}/${repo}/commits/${ref}`, "-q", ".sha"],
      { encoding: "utf8", env },
    ).trim();
  } catch {
    return execFileSync(
      "gh",
      [
        "api",
        `repos/${owner}/${repo}/git/ref/heads/${ref}`,
        "-q",
        ".object.sha",
      ],
      { encoding: "utf8", env },
    ).trim();
  }
}

const ref = (process.env.RESOURCES_GIT_REF?.trim() || "main").trim();
const url = (
  process.env.RESOURCES_GIT_URL?.trim() || defaultResourcesGitUrl()
).trim();
const token = process.env.RESOURCES_GIT_TOKEN?.trim();
const useSsh = Boolean(process.env.GIT_SSH_COMMAND?.trim());

let sha: string;
if (/^[0-9a-f]{40}$/i.test(ref)) {
  sha = ref.toLowerCase();
} else if (token && !useSsh) {
  const slug = parseGithubRepo(url);
  if (!slug) {
    console.error(`::error::Could not parse GitHub repo from ${repoLabel(url)}`);
    process.exit(1);
  }
  try {
    sha = resolveShaViaGitHubApi(slug.owner, slug.repo, ref, token);
  } catch {
    console.error(
      `::error::Could not resolve ${slug.owner}/${slug.repo} ref "${ref}" via GitHub API. ` +
        "Check RESOURCES_GIT_REF and RESOURCES_GIT_TOKEN (repo read on mc-content).",
    );
    process.exit(1);
  }
} else {
  const cloneUrl = authenticatedCloneUrl(url, token);
  try {
    const out = execFileSync(
      "git",
      ["ls-remote", cloneUrl, `refs/heads/${ref}`],
      { encoding: "utf8" },
    );
    sha = out.split(/\s+/)[0] ?? "";
  } catch {
    console.error(
      `::error::Could not ls-remote ${repoLabel(url)} for ref "${ref}". ` +
        (useSsh
          ? "Check MC_CONTENT_DEPLOY_KEY on mc-content."
          : "Set RESOURCES_GIT_TOKEN or MC_CONTENT_DEPLOY_KEY."),
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