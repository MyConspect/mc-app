import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { resourcesDir } from "@/lib/parse/load";
import {
  extractInterviewAnchorTitles,
  parseTopicOutline,
} from "@/lib/parse/parse";

export type InterviewAnchorMismatch = {
  readonly file: string;
  readonly anchorCount: number;
  readonly blockCount: number;
};

const INTERVIEW_FILE = /_interview\.md$/;

export function listInterviewBasenames(): string[] {
  const enDir = resourcesDir(DEFAULT_LOCALE);
  if (!fs.existsSync(enDir)) {
    return [];
  }
  return fs
    .readdirSync(enDir)
    .filter((name) => INTERVIEW_FILE.test(name))
    .sort();
}

export function auditInterviewAnchorParity(
  files?: readonly string[],
): InterviewAnchorMismatch[] {
  const basenames = files ?? listInterviewBasenames();
  const mismatches: InterviewAnchorMismatch[] = [];

  for (const file of basenames) {
    const enPath = path.join(resourcesDir(DEFAULT_LOCALE), file);
    const ruPath = path.join(resourcesDir("ru"), file);
    if (!fs.existsSync(enPath) || !fs.existsSync(ruPath)) {
      continue;
    }
    const enMarkdown = fs.readFileSync(enPath, "utf8");
    const ruMarkdown = fs.readFileSync(ruPath, "utf8");
    const anchorCount = extractInterviewAnchorTitles(enMarkdown).length;
    const blockCount = parseTopicOutline(ruMarkdown, "ru", {}).filter(
      (item) => item.interviewSection,
    ).length;
    if (anchorCount !== blockCount) {
      mismatches.push({ file, anchorCount, blockCount });
    }
  }

  return mismatches;
}

export function formatInterviewAnchorReport(
  mismatches: readonly InterviewAnchorMismatch[],
): string {
  if (mismatches.length === 0) {
    return "interview-anchors: EN/RU block parity ok";
  }
  const lines = [
    `interview-anchors: ${mismatches.length} mismatch(es) (EN anchor count vs RU parsed blocks)`,
    "",
  ];
  for (const row of mismatches) {
    const delta = row.anchorCount - row.blockCount;
    const sign = delta > 0 ? "+" : "";
    lines.push(
      `${row.file}: ${row.anchorCount} anchors vs ${row.blockCount} blocks (${sign}${delta})`,
    );
  }
  return lines.join("\n");
}