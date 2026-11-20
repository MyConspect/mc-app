import fs from "node:fs";
import path from "node:path";
import { TRACKS, getTopic, type Topic, type TrackId } from "@/lib/catalog";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import {
  isBehaviorQuestionsTopic,
  localizeBehaviorOutline,
} from "@/lib/i18n/behaviorQuestions";
import { withSidebarConceptOutlines } from "@/lib/nav/chromeNav";
import { handbookNavForTrack } from "@/lib/nav/handbook";
import { navTopics } from "@/lib/nav/search";
import type { NavGroup, NavTopic } from "@/lib/nav";
import {
  conceptsForConspectTopic,
  shouldHideSidebarConcepts,
} from "@/lib/nav/navUtils";
import { loadTopicOutline } from "@/lib/parse";

export type SidebarOutlineSource = "nav" | "shell" | "index";

export type SidebarOutlineMismatch = {
  readonly locale: Locale;
  readonly track: string;
  readonly topicSlug: string;
  readonly href: string;
  readonly source: SidebarOutlineSource;
  readonly missingIds: readonly string[];
  readonly extraIds: readonly string[];
};

/** Parent hub row: children are nested topics, not `concepts` (Core, JS Browser hub, …). */
export function isNavParentHubRow(topic: NavTopic): boolean {
  return (
    topic.concepts.length === 0 && (topic.nestedTopics?.length ?? 0) > 0
  );
}

export function navRowsBySlug(
  topics: readonly NavTopic[],
): Map<string, NavTopic[]> {
  const map = new Map<string, NavTopic[]>();
  for (const topic of topics) {
    const list = map.get(topic.slug) ?? [];
    list.push(topic);
    map.set(topic.slug, list);
  }
  return map;
}

/** Title-twin markdown groups use several rows with the same `slug` + href. */
export function aggregatedNavConceptIds(
  rows: readonly NavTopic[],
): readonly string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (isNavParentHubRow(row)) {
      continue;
    }
    for (const concept of row.concepts) {
      ids.add(concept.id);
    }
  }
  return [...ids];
}

export function expectedNavOutlineIds(
  topic: Topic,
  locale: Locale,
): readonly string[] | null {
  const parsed = loadTopicOutline(topic, locale);
  if (parsed.length === 0) {
    return null;
  }
  let outline = conceptsForConspectTopic(topic, parsed);
  if (isBehaviorQuestionsTopic(topic)) {
    outline = localizeBehaviorOutline(outline, locale);
  }
  return outline.map((concept) => concept.id);
}

export function shouldSkipSidebarOutlineAudit(
  catalogTopic: Topic,
  rows: readonly NavTopic[],
): boolean {
  if (shouldHideSidebarConcepts(catalogTopic)) {
    return true;
  }
  if (rows.length === 0) {
    return true;
  }
  return rows.every(isNavParentHubRow);
}

function diffConceptIds(
  expected: readonly string[],
  actual: readonly string[],
): { missingIds: string[]; extraIds: string[] } {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return {
    missingIds: expected.filter((id) => !actualSet.has(id)),
    extraIds: actual.filter((id) => !expectedSet.has(id)),
  };
}

export function auditSidebarOutlines(
  options: { indexRoot?: string; trackIds?: readonly TrackId[] } = {},
): readonly SidebarOutlineMismatch[] {
  const indexRoot =
    options.indexRoot ?? path.join(process.cwd(), "public", "search-index");
  const mismatches: SidebarOutlineMismatch[] = [];
  const trackFilter = options.trackIds ? new Set(options.trackIds) : null;
  const tracks = trackFilter
    ? TRACKS.filter((track) => trackFilter.has(track.id))
    : TRACKS;

  for (const locale of LOCALES) {
    for (const track of tracks) {
      const groups = handbookNavForTrack(locale, track.id);
      const shellGroups = withSidebarConceptOutlines(groups);
      const indexFile = path.join(indexRoot, locale, `${track.id}.json`);
      const indexGroups = fs.existsSync(indexFile)
        ? (JSON.parse(fs.readFileSync(indexFile, "utf8")) as NavGroup[])
        : null;

      const navList = navTopics(groups);
      const bySlug = navRowsBySlug(navList);
      const seenSlugs = new Set<string>();

      const sources: ReadonlyArray<{
        source: SidebarOutlineSource;
        rowsBySlug: Map<string, NavTopic[]>;
      }> = [
        { source: "nav", rowsBySlug: bySlug },
        {
          source: "shell",
          rowsBySlug: navRowsBySlug(navTopics(shellGroups)),
        },
        ...(indexGroups
          ? [
              {
                source: "index" as const,
                rowsBySlug: navRowsBySlug(navTopics(indexGroups)),
              },
            ]
          : []),
      ];

      for (const navTopic of navList) {
        if (seenSlugs.has(navTopic.slug)) {
          continue;
        }
        seenSlugs.add(navTopic.slug);

        const catalogTopic = getTopic(track.id, navTopic.slug);
        if (!catalogTopic) {
          continue;
        }
        const rows = bySlug.get(navTopic.slug) ?? [];
        if (shouldSkipSidebarOutlineAudit(catalogTopic, rows)) {
          continue;
        }
        const expected = expectedNavOutlineIds(catalogTopic, locale);
        if (!expected) {
          continue;
        }

        for (const { source, rowsBySlug } of sources) {
          const sourceRows = rowsBySlug.get(navTopic.slug);
          if (!sourceRows?.length) {
            mismatches.push({
              locale,
              track: track.id,
              topicSlug: navTopic.slug,
              href: navTopic.href,
              source,
              missingIds: [...expected],
              extraIds: [],
            });
            continue;
          }
          const actual = aggregatedNavConceptIds(sourceRows);
          const { missingIds, extraIds } = diffConceptIds(expected, actual);
          if (missingIds.length > 0 || extraIds.length > 0) {
            mismatches.push({
              locale,
              track: track.id,
              topicSlug: navTopic.slug,
              href: navTopic.href,
              source,
              missingIds,
              extraIds,
            });
          }
        }
      }
    }
  }

  return mismatches;
}

export function formatSidebarOutlineReport(
  mismatches: readonly SidebarOutlineMismatch[],
): string {
  if (mismatches.length === 0) {
    return "sidebar-outlines: OK (nav, shell, and search index match parsed topics)";
  }
  const lines = [`sidebar-outlines: ${mismatches.length} mismatch(es)`, ""];
  for (const row of mismatches) {
    lines.push(
      `${row.locale} ${row.track} ${row.topicSlug} [${row.source}] ${row.href}`,
    );
    if (row.missingIds.length > 0) {
      lines.push(`  missing: ${row.missingIds.join(", ")}`);
    }
    if (row.extraIds.length > 0) {
      lines.push(`  extra: ${row.extraIds.join(", ")}`);
    }
    lines.push("");
  }
  lines.push(
    "Fix: update resources, bump parse revision if needed, run npm run prebuild",
  );
  return lines.join("\n");
}
