import fs from "node:fs";
import path from "node:path";

const HANDBOOK_INDEX_MAIN =
  /\bhandbook-(?:subject|topic)-main\b/;
const ALLOWED_MAX_W = /\bmax-w-none\b/;
const FORBIDDEN_MAX_W =
  /\bmax-w-(?:0|none|full|min|max|fit|prose|screen|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\b/g;

export type HandbookIndexShellViolation = {
  readonly file: string;
  readonly line: number;
  readonly text: string;
  readonly reason: string;
};

function relFromMcApp(mcAppRoot: string, absolute: string): string {
  return path.relative(mcAppRoot, absolute).split(path.sep).join("/");
}

/**
 * Index list routes must use full main width (`max-w-none`) so newspaper columns
 * can use 2–3 tracks on wide viewports. Narrow `max-w-*` on the same line as
 * `handbook-*-main` is a layout regression (e.g. `/behavior` stuck at 2 columns).
 */
export function auditHandbookIndexShellLine(
  line: string,
  lineNumber: number,
  file: string,
): HandbookIndexShellViolation[] {
  if (!HANDBOOK_INDEX_MAIN.test(line)) {
    return [];
  }
  if (ALLOWED_MAX_W.test(line)) {
    const otherMax = [...line.matchAll(FORBIDDEN_MAX_W)]
      .map((m) => m[0])
      .filter((token) => token !== "max-w-none");
    if (otherMax.length === 0) {
      return [];
    }
  }

  const maxTokens = [...line.matchAll(FORBIDDEN_MAX_W)].map((m) => m[0]);
  const narrow = maxTokens.filter((token) => token !== "max-w-none");
  if (narrow.length === 0 && !ALLOWED_MAX_W.test(line)) {
    return [
      {
        file,
        line: lineNumber,
        text: line.trim(),
        reason:
          "handbook index main must declare max-w-none (full width for column layout)",
      },
    ];
  }
  if (narrow.length > 0) {
    return [
      {
        file,
        line: lineNumber,
        text: line.trim(),
        reason: `handbook index main must not use ${narrow.join(", ")} — use max-w-none`,
      },
    ];
  }
  return [];
}

export function auditHandbookIndexShellSource(
  source: string,
  file: string,
): HandbookIndexShellViolation[] {
  const out: HandbookIndexShellViolation[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    out.push(...auditHandbookIndexShellLine(lines[i] ?? "", i + 1, file));
  }
  return out;
}

function walkTsx(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }
      walkTsx(full, out);
      continue;
    }
    if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
}

export type AuditHandbookIndexShellOptions = {
  readonly mcAppRoot?: string;
  readonly scanDirs?: readonly string[];
};

export function auditHandbookIndexShell(
  options: AuditHandbookIndexShellOptions = {},
): HandbookIndexShellViolation[] {
  const mcAppRoot = options.mcAppRoot ?? process.cwd();
  const scanDirs = options.scanDirs ?? ["app", "components"];
  const files: string[] = [];
  for (const dir of scanDirs) {
    const abs = path.join(mcAppRoot, dir);
    if (fs.existsSync(abs)) {
      walkTsx(abs, files);
    }
  }

  const violations: HandbookIndexShellViolation[] = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const rel = relFromMcApp(mcAppRoot, file);
    violations.push(...auditHandbookIndexShellSource(source, rel));
  }
  return violations;
}

export function formatHandbookIndexShellReport(
  violations: readonly HandbookIndexShellViolation[],
): string {
  if (violations.length === 0) {
    return "handbook-index-shell: ok";
  }
  const lines = violations.map(
    (v) => `${v.file}:${v.line}: ${v.reason}\n  ${v.text}`,
  );
  return [
    "handbook-index-shell: index main width violations",
    "",
    ...lines,
  ].join("\n");
}