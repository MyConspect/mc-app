import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function maxIsoDate(
  dates: readonly (string | null | undefined)[],
): string | null {
  let max: string | null = null;
  for (const date of dates) {
    if (!date || !ISO_DATE.test(date)) continue;
    if (!max || date > max) max = date;
  }
  return max;
}

function gitIsoDate(paths: readonly string[]): string | null {
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", ...paths],
      {
        encoding: "utf8",
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    return ISO_DATE.test(iso) ? iso : null;
  } catch {
    return null;
  }
}

function resourcesHaveLocalChanges(): boolean {
  try {
    const out = execFileSync(
      "git",
      ["status", "--porcelain", "--untracked-files=normal", "--", "resources"],
      {
        encoding: "utf8",
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    return out.length > 0;
  } catch {
    return false;
  }
}

function resourcesMtimeIso(): string | null {
  try {
    let max = 0;
    for (const locale of ["en", "ru"] as const) {
      const dir = join(process.cwd(), "resources", locale);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".md")) continue;
        const mtime = statSync(
          join(process.cwd(), "resources", locale, name),
        ).mtimeMs;
        if (mtime > max) max = mtime;
      }
    }
    if (!max) return null;
    const date = new Date(max);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/** Resolves the footer date at build/dev time (may shell out to git). */
export function siteLastUpdatedIsoLive(): string {
  const notesCommit = gitIsoDate(["resources"]);
  const repoCommit = gitIsoDate([]);
  const localNotes =
    process.env.NODE_ENV === "development" && resourcesHaveLocalChanges()
      ? resourcesMtimeIso()
      : null;
  return (
    maxIsoDate([notesCommit, repoCommit, localNotes]) ??
    new Date().toISOString().slice(0, 10)
  );
}
