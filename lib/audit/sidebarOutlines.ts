import fs from "node:fs";
import path from "node:path";
import { TRACKS, getTopic, type Topic, type TrackId } from "@/lib/catalog";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { withSidebarConceptOutlines } from "@/lib/nav/chromeNav";
import { handbookNavForTrack } from "@/lib/nav/handbook";
import { navTopics } from "@/lib/nav/search";
import type { NavGroup, NavTopic } from "@/lib/nav";
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

function conceptIds(topic: NavTopic): readonly string[] {
  return topic.concepts.map((concept) => concept.id);
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

function expectedOutlineIds(
  topic: Topic,
  locale: Locale,
): readonly string[] | null {
  const outline = loadTopicOutline(topic, locale);
  if (outline.length === 0) {
    return null;
  }
  return outline.map((concept) => concept.id);
}

export function auditSidebarOutlines(
  options: { indexRoot?: string; trackIds?: readonly TrackId[] } = {},
): readonly SidebarOutlineMismatch[] {
  const indexRoot =
    options.indexRoot ?? path.join(process.cwd(), "public", "search-index");
  const mismatches: SidebarOutlineMismatch[] = [];
  const trackFilter = options.trackIds
    ? new Set(options.trackIds)
    : null;
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

      const sources: ReadonlyArray<{
        source: SidebarOutlineSource;
        byHref: Map<string, NavTopic>;
      }> = [
        {
          source: "nav",
          byHref: new Map(navTopics(groups).map((t) => [t.href, t])),
        },
        {
          source: "shell",
          byHref: new Map(navTopics(shellGroups).map((t) => [t.href, t])),
        },
        ...(indexGroups
          ? [
              {
                source: "index" as const,
                byHref: new Map(navTopics(indexGroups).map((t) => [t.href, t])),
              },
            ]
          : []),
      ];

      for (const navTopic of navTopics(groups)) {
        if (navTopic.hideSidebarConcepts) {
          continue;
        }
        const catalogTopic = getTopic(track.id, navTopic.slug);
        if (!catalogTopic) {
          continue;
        }
        const expected = expectedOutlineIds(catalogTopic, locale);
        if (!expected) {
          continue;
        }

        for (const { source, byHref } of sources) {
          const topic = byHref.get(navTopic.href);
          if (!topic) {
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
          const { missingIds, extraIds } = diffConceptIds(
            expected,
            conceptIds(topic),
          );
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
