import fs from "node:fs";
import path from "node:path";
import { TOPICS } from "@/lib/catalog";
import { chromeFor } from "@/lib/i18n/chrome";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import {
  conceptIndexPanePackOptionsForEntries,
  CONCEPT_INDEX_SINGLE_SECTION_PANE_PACK_MIN_ITEMS,
} from "@/lib/catalog/clusterIndexFitsPane";
import { conceptIndexLayoutModeForEntries } from "@/lib/catalog/conceptIndexPaneLayoutMode";
import { loadFileOutline } from "@/lib/parse/load";
import type { ConceptOutline } from "@/lib/parse";
import {
  conceptIndexSectionWeight,
  conceptsForIndexSection,
  groupConcepts,
} from "@/components/topic/conceptIndexGroups";
import type { SubjectHubConcept } from "@/lib/catalog/subjectHubConcepts";

const PREFER_NEWSPAPER_ONE =
  /preferNewspaperFrom\s*:\s*1\b/;

export type HandbookIndexLayoutViolation = {
  readonly file?: string;
  readonly line?: number;
  readonly topicKey?: string;
  readonly reason: string;
};

function relFromMcApp(mcAppRoot: string, absolute: string): string {
  return path.relative(mcAppRoot, absolute).split(path.sep).join("/");
}

/** `preferNewspaperFrom: 1` forces newspaper on every leaf hub (regression). */
export function auditPreferNewspaperFromOne(
  mcAppRoot: string,
): HandbookIndexLayoutViolation[] {
  const roots = [
    path.join(mcAppRoot, "components"),
    path.join(mcAppRoot, "app"),
  ];
  const violations: HandbookIndexLayoutViolation[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      if (name === "node_modules" || name.startsWith(".")) {
        continue;
      }
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx|ts)$/.test(name)) {
        continue;
      }
      const text = fs.readFileSync(full, "utf8");
      if (!PREFER_NEWSPAPER_ONE.test(text)) {
        continue;
      }
      const lines = text.split("\n");
      lines.forEach((line, index) => {
        if (PREFER_NEWSPAPER_ONE.test(line)) {
          violations.push({
            file: relFromMcApp(mcAppRoot, full),
            line: index + 1,
            reason:
              "Do not use preferNewspaperFrom: 1 — it newspaper-wraps single-section leaf indexes",
          });
        }
      });
    }
  };
  for (const root of roots) {
    if (fs.existsSync(root)) {
      walk(root);
    }
  }
  return violations;
}

function theoryGroupedOutlines(
  outlines: readonly ConceptOutline[],
): boolean {
  return outlines.some((row) => Boolean(row.group?.trim()));
}

/** Catalog topics: medium single-section indexes must stack, not pane-pack. */
export function auditCatalogTopicLayoutModes(): HandbookIndexLayoutViolation[] {
  const chrome = chromeFor(DEFAULT_LOCALE);
  const violations: HandbookIndexLayoutViolation[] = [];

  for (const topic of TOPICS) {
    let outlines: readonly ConceptOutline[];
    try {
      outlines = loadFileOutline(topic.file, DEFAULT_LOCALE);
    } catch {
      continue;
    }
    if (outlines.length === 0 || !theoryGroupedOutlines(outlines)) {
      continue;
    }
    const concepts = outlines as readonly SubjectHubConcept[];
    const groups = groupConcepts(concepts, true, chrome);
    const entries = groups.map((group) => ({
      weight: conceptIndexSectionWeight(group),
      listItemCount: conceptsForIndexSection(group).length,
    }));
    if (entries.length === 0) {
      continue;
    }
    const mode = conceptIndexLayoutModeForEntries(entries);
    const panePack = conceptIndexPanePackOptionsForEntries(entries);
    const topicKey = `${topic.track}/${topic.slug}`;

    if (
      entries.length === 1 &&
      entries[0].listItemCount < CONCEPT_INDEX_SINGLE_SECTION_PANE_PACK_MIN_ITEMS
    ) {
      if (mode === "newspaper") {
        violations.push({
          topicKey,
          reason: `Single section (${entries[0].listItemCount} rows) must use stack, not newspaper`,
        });
      }
      if (panePack) {
        violations.push({
          topicKey,
          reason: `Single section (${entries[0].listItemCount} rows) must not use pane pack`,
        });
      }
    }
  }

  return violations;
}

export function auditHandbookIndexLayoutPolicy(
  mcAppRoot: string = path.join(process.cwd()),
): HandbookIndexLayoutViolation[] {
  return [
    ...auditPreferNewspaperFromOne(mcAppRoot),
    ...auditCatalogTopicLayoutModes(),
  ];
}

export function formatHandbookIndexLayoutReport(
  violations: readonly HandbookIndexLayoutViolation[],
): string {
  if (violations.length === 0) {
    return "handbook-index-layout: ok";
  }
  return [
    "handbook-index-layout: failed",
    ...violations.map((v) => {
      const where = v.file
        ? `${v.file}:${v.line ?? "?"}`
        : (v.topicKey ?? "unknown");
      return `  ${where}: ${v.reason}`;
    }),
  ].join("\n");
}