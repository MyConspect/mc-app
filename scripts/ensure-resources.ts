import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { resourcesRoot } from "../lib/resourcesRoot";

loadEnvConfig(process.cwd());

const DEFAULT_RESOURCES_DIR = path.join(process.cwd(), "resources");
const NOTES_REVISION_FILE = path.join(DEFAULT_RESOURCES_DIR, ".notes-revision");

function readNotesRevision(): string | undefined {
  try {
    return fs.readFileSync(NOTES_REVISION_FILE, "utf8").trim();
  } catch {
    return undefined;
  }
}

function writeNotesRevision(commit: string): void {
  fs.mkdirSync(DEFAULT_RESOURCES_DIR, { recursive: true });
  fs.writeFileSync(NOTES_REVISION_FILE, `${commit}\n`, "utf8");
}

function expectedNotesRevision(): string | undefined {
  return (
    process.env.CONTENT_REVISION?.trim() ||
    process.env.RESOURCES_GIT_SHA?.trim()
  );
}

function enDir(): string {
  return path.join(resourcesRoot(), "en");
}

function enHasCatalogMarkdown(): boolean {
  const dir = enDir();
  if (!fs.existsSync(dir)) return false;
  return fs
    .readdirSync(dir)
    .some((name) => name.endsWith(".md") && name !== "0_me.md");
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

function cloneNotesRepository(
  url: string,
  ref: string,
  token: string | undefined,
  useSsh: boolean,
  destination: string,
): void {
  const slug = parseGithubRepo(url);
  const ghEnv = {
    ...process.env,
    ...(token ? { GH_TOKEN: token, GITHUB_TOKEN: token } : {}),
    GIT_TERMINAL_PROMPT: "0",
  };

  if (token && !useSsh && slug) {
    execFileSync(
      "gh",
      [
        "repo",
        "clone",
        `${slug.owner}/${slug.repo}`,
        destination,
        "--",
        "-b",
        ref,
        "--depth",
        "1",
      ],
      { stdio: "inherit", env: ghEnv },
    );
    return;
  }

  const cloneUrl = authenticatedCloneUrl(url, token);
  execFileSync(
    "git",
    ["clone", "--depth", "1", "--branch", ref, cloneUrl, destination],
    { stdio: "inherit", env: ghEnv },
  );
}

function resolveCloneLayout(cloneRoot: string): string {
  const nested = path.join(cloneRoot, "resources", "en");
  if (fs.existsSync(nested)) return path.join(cloneRoot, "resources");
  const atRoot = path.join(cloneRoot, "en");
  if (fs.existsSync(atRoot)) return cloneRoot;
  throw new Error(
    `Cloned repository has no resources layout (expected resources/en/ or en/ at repo root).`,
  );
}

function fetchFromGit(): void {
  const url = process.env.RESOURCES_GIT_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing study notes: notes en/ is empty and RESOURCES_GIT_URL is not set.\n" +
        "For local dev, set MYCONSPECT_NOTES_ROOT=../mc-content in mc-app/.env.local " +
        "or keep resources/ on disk.\n" +
        "For Vercel/CI, set RESOURCES_GIT_URL (+ RESOURCES_GIT_TOKEN for a private repo). See README § CI/CD.",
    );
  }

  const ref = process.env.RESOURCES_GIT_REF?.trim() || "main";
  const token = process.env.RESOURCES_GIT_TOKEN?.trim();
  const useSsh = Boolean(process.env.GIT_SSH_COMMAND?.trim());
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "myconspect-resources-"));

  try {
    cloneNotesRepository(url, ref, token, useSsh, tmp);
    const commit = execFileSync("git", ["-C", tmp, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const sourceRoot = resolveCloneLayout(tmp);
    fs.rmSync(DEFAULT_RESOURCES_DIR, { recursive: true, force: true });
    fs.cpSync(sourceRoot, DEFAULT_RESOURCES_DIR, { recursive: true });
    writeNotesRevision(commit);
    console.log(
      `ensure-resources: fetched ref "${ref}" (${commit}) from ${url}`,
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  if (!enHasCatalogMarkdown()) {
    throw new Error(
      `Fetched repository did not produce catalog markdown under en/.`,
    );
  }
}

function shouldFetchInCi(): boolean {
  return (
    process.env.CI === "true" &&
    Boolean(process.env.RESOURCES_GIT_URL?.trim()) &&
    !process.env.MYCONSPECT_NOTES_ROOT?.trim()
  );
}

function main(): void {
  if (shouldFetchInCi()) {
    const expected = expectedNotesRevision();
    const cached = readNotesRevision();
    if (expected && cached === expected && enHasCatalogMarkdown()) {
      console.log(
        `ensure-resources: using cached mc-content at ${expected} (${resourcesRoot()})`,
      );
      return;
    }
    fetchFromGit();
    return;
  }

  if (enHasCatalogMarkdown()) {
    const root = resourcesRoot();
    const viaEnv = Boolean(process.env.MYCONSPECT_NOTES_ROOT?.trim());
    console.log(
      viaEnv
        ? `ensure-resources: using MYCONSPECT_NOTES_ROOT (${root})`
        : `ensure-resources: using local resources/ (${root})`,
    );
    return;
  }

  if (process.env.MYCONSPECT_NOTES_ROOT?.trim()) {
    throw new Error(
      `MYCONSPECT_NOTES_ROOT points to ${resourcesRoot()} but en/ has no catalog markdown.`,
    );
  }

  fetchFromGit();
}

main();
