import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import {
  TOPICS,
  getTopic,
  hubFileForTrack,
  topicForFile,
  type Topic,
  type TrackId,
} from "@/lib/catalog";
import {
  isFunctionsTopicSlug,
  withFunctionsConceptGroups,
} from "@/lib/catalog/functionsHub";
import {
  isModulesTopicSlug,
  withModulesConceptGroups,
} from "@/lib/catalog/modulesHub";
import {
  isBrowserDocumentTopicSlug,
  withBrowserDocumentConceptGroups,
} from "@/lib/catalog/browserDocumentHub";
import {
  isCoreBrowserTopicSlug,
  withCoreBrowserConceptGroups,
} from "@/lib/catalog/coreBrowserHub";
import {
  isCssArchitectureTopicSlug,
  withCssArchitectureConceptGroups,
} from "@/lib/catalog/cssArchitectureHub";
import {
  isCssCoreTopicSlug,
  withCssCoreConceptGroups,
} from "@/lib/catalog/cssCoreHub";
import {
  isCssLayoutTopicSlug,
  withCssLayoutConceptGroups,
} from "@/lib/catalog/cssLayoutHub";
import {
  isCssModernTopicSlug,
  withCssModernConceptGroups,
} from "@/lib/catalog/cssModernHub";
import {
  isCssMotionTopicSlug,
  withCssMotionConceptGroups,
} from "@/lib/catalog/cssMotionHub";
import {
  isCssVisualTopicSlug,
  withCssVisualConceptGroups,
} from "@/lib/catalog/cssVisualHub";
import {
  isEventsTopicSlug,
  withEventsConceptGroups,
} from "@/lib/catalog/eventsHub";
import {
  isObjectsTopicSlug,
  withObjectsConceptGroups,
} from "@/lib/catalog/objectsHub";
import {
  isNextjsA11ySeoTopicSlug,
  withNextjsA11ySeoConceptGroups,
} from "@/lib/catalog/nextjsA11ySeoHub";
import {
  isNextjsDataTopicSlug,
  withNextjsDataConceptGroups,
} from "@/lib/catalog/nextjsDataHub";
import {
  TYPES_HUB_REFERENCE_GROUP,
  TYPES_HUB_SECTIONS,
  TYPES_HUB_SLUG,
  isTypesHubSlug,
  withConceptGroup,
} from "@/lib/catalog/typesHub";
import { resourcesRoot } from "@/lib/resourcesRoot";
import {
  parseTopicMarkdown,
  parseTopicOutline,
  type Concept,
  type ConceptOutline,
  type ParseOptions,
  type ParsedTopic,
} from "./parse";

type StoredRead = {
  readonly stamp: string;
  readonly result: ReadTopicResult;
};

type OutlineEntry = {
  readonly stamp: string;
  readonly value: readonly ConceptOutline[];
};

type ParsedEntry = {
  readonly stamp: string;
  readonly promise: Promise<ParsedTopic>;
};

const PARSE_LOGIC_REVISION = 33;

type ParseCache = {
  markdown: Map<string, StoredRead>;
  outlines: Map<string, OutlineEntry>;
  parsed: Map<string, ParsedEntry>;
};

const globalForParse = globalThis as typeof globalThis & {
  __topicParseCache?: ParseCache;
};

function parseCache(): ParseCache {
  globalForParse.__topicParseCache ??= {
    markdown: new Map(),
    outlines: new Map(),
    parsed: new Map(),
  };
  return globalForParse.__topicParseCache;
}

export function resourcesDir(locale: Locale = DEFAULT_LOCALE): string {
  return path.join(resourcesRoot(), locale);
}

export type ReadTopicResult = {
  readonly markdown: string;
  readonly locale: Locale;
  readonly usedFallback: boolean;
};

function resolveInside(locale: Locale, file: string): string {
  const dir = resourcesDir(locale);
  const resolved = path.resolve(dir, file);
  if (!resolved.startsWith(path.resolve(dir))) {
    throw new Error(`Refusing to read outside resources/${locale}/: ${file}`);
  }
  return resolved;
}

function cacheKey(locale: Locale, file: string): string {
  return `${locale}\0${file}`;
}

function fileStamp(absPath: string): string | undefined {
  try {
    const stat = fs.statSync(absPath);
    return `${stat.mtimeMs}:${stat.size}`;
  } catch {
    return undefined;
  }
}

function loadDetailed(file: string, locale: Locale): StoredRead {
  const primary = resolveInside(locale, file);
  const primaryStamp = fileStamp(primary);
  const key = cacheKey(locale, file);
  const store = parseCache().markdown;

  if (primaryStamp) {
    const stamp = `own:${primaryStamp}`;
    const hit = store.get(key);
    if (hit?.stamp === stamp) {
      return hit;
    }
    const stored: StoredRead = {
      stamp,
      result: {
        markdown: fs.readFileSync(primary, "utf8"),
        locale,
        usedFallback: false,
      },
    };
    store.set(key, stored);
    return stored;
  }

  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolveInside(DEFAULT_LOCALE, file);
    const fallbackStamp = fileStamp(fallback);
    if (fallbackStamp) {
      const stamp = `fallback:${fallbackStamp}`;
      const hit = store.get(key);
      if (hit?.stamp === stamp) {
        return hit;
      }
      const stored: StoredRead = {
        stamp,
        result: {
          markdown: fs.readFileSync(fallback, "utf8"),
          locale: DEFAULT_LOCALE,
          usedFallback: true,
        },
      };
      store.set(key, stored);
      return stored;
    }
  }

  throw new Error(
    `Missing topic file in resources/${locale}/: ${file} (cwd=${process.cwd()})`,
  );
}

export function readTopicFile(
  file: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return readTopicFileDetailed(file, locale).markdown;
}

export function readTopicFileDetailed(
  file: string,
  locale: Locale = DEFAULT_LOCALE,
): ReadTopicResult {
  return loadDetailed(file, locale).result;
}

export function topicFileExists(file: string, locale: Locale): boolean {
  return fs.existsSync(resolveInside(locale, file));
}

function anchorMarkdownFor(file: string, locale: Locale): string | undefined {
  if (locale === DEFAULT_LOCALE) {
    return undefined;
  }
  const enPath = resolveInside(DEFAULT_LOCALE, file);
  if (!fs.existsSync(enPath)) {
    return undefined;
  }
  return fs.readFileSync(enPath, "utf8");
}

function parseOptionsForFile(file: string, locale: Locale): ParseOptions {
  const topic = topicForFile(file);
  const anchorMarkdown = anchorMarkdownFor(file, locale);
  return {
    ...(topic?.hideAnswers ? { hideAnswers: true as const } : {}),
    locale,
    ...(anchorMarkdown ? { anchorMarkdown } : {}),
  };
}

function loadTypesHubOutline(
  topic: Topic,
  locale: Locale,
): readonly ConceptOutline[] {
  return loadGroupedHubOutline(
    topic,
    locale,
    TYPES_HUB_REFERENCE_GROUP,
    TYPES_HUB_SECTIONS,
  );
}

function loadGroupedHubOutline(
  topic: Topic,
  locale: Locale,
  referenceGroup: string,
  sections: readonly { readonly slug: string; readonly group: string }[],
): readonly ConceptOutline[] {
  const merged: ConceptOutline[] = withConceptGroup(
    loadTopicOutlineSingle(topic, locale),
    referenceGroup,
  );
  for (const section of sections) {
    const child = getTopic(topic.track, section.slug);
    if (!child) {
      continue;
    }
    merged.push(
      ...withConceptGroup(loadTopicOutlineSingle(child, locale), section.group),
    );
  }
  return merged;
}

function loadTopicOutlineSingle(
  topic: Topic,
  locale: Locale = DEFAULT_LOCALE,
): readonly ConceptOutline[] {
  const { stamp, result } = loadDetailed(topic.file, locale);
  const key = cacheKey(locale, topic.file);
  const store = parseCache().outlines;
  const outlineStamp = `${stamp}|rev:${PARSE_LOGIC_REVISION}`;
  const hit = store.get(key);
  if (hit?.stamp === outlineStamp) {
    return hit.value;
  }
  const value = outlineForTopic(
    topic,
    parseTopicOutline(
      result.markdown,
      locale,
      parseOptionsForFile(topic.file, locale),
    ),
  );
  store.set(key, { stamp: outlineStamp, value });
  return value;
}

function outlineForTopic(
  topic: Topic,
  outline: readonly ConceptOutline[],
): readonly ConceptOutline[] {
  if (isFunctionsTopicSlug(topic.slug)) {
    return withFunctionsConceptGroups(outline);
  }
  if (isObjectsTopicSlug(topic.slug)) {
    return withObjectsConceptGroups(outline);
  }
  if (isModulesTopicSlug(topic.slug)) {
    return withModulesConceptGroups(outline);
  }
  if (isBrowserDocumentTopicSlug(topic.slug)) {
    return withBrowserDocumentConceptGroups(outline);
  }
  if (isCoreBrowserTopicSlug(topic.slug)) {
    return withCoreBrowserConceptGroups(outline);
  }
  if (isCssLayoutTopicSlug(topic.slug)) {
    return withCssLayoutConceptGroups(outline);
  }
  if (isCssCoreTopicSlug(topic.slug)) {
    return withCssCoreConceptGroups(outline);
  }
  if (isCssVisualTopicSlug(topic.slug)) {
    return withCssVisualConceptGroups(outline);
  }
  if (isCssMotionTopicSlug(topic.slug)) {
    return withCssMotionConceptGroups(outline);
  }
  if (isCssModernTopicSlug(topic.slug)) {
    return withCssModernConceptGroups(outline);
  }
  if (isCssArchitectureTopicSlug(topic.slug)) {
    return withCssArchitectureConceptGroups(outline);
  }
  if (isEventsTopicSlug(topic.slug)) {
    return withEventsConceptGroups(outline);
  }
  if (isNextjsA11ySeoTopicSlug(topic.slug)) {
    return withNextjsA11ySeoConceptGroups(outline);
  }
  if (isNextjsDataTopicSlug(topic.slug)) {
    return withNextjsDataConceptGroups(outline);
  }
  return outline;
}

function parsedForTopic(topic: Topic, parsed: ParsedTopic): ParsedTopic {
  if (isFunctionsTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withFunctionsConceptGroups(parsed.concepts),
    };
  }
  if (isObjectsTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withObjectsConceptGroups(parsed.concepts),
    };
  }
  if (isModulesTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withModulesConceptGroups(parsed.concepts),
    };
  }
  if (isBrowserDocumentTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withBrowserDocumentConceptGroups(parsed.concepts),
    };
  }
  if (isCoreBrowserTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCoreBrowserConceptGroups(parsed.concepts),
    };
  }
  if (isCssLayoutTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssLayoutConceptGroups(parsed.concepts),
    };
  }
  if (isCssCoreTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssCoreConceptGroups(parsed.concepts),
    };
  }
  if (isCssVisualTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssVisualConceptGroups(parsed.concepts),
    };
  }
  if (isCssMotionTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssMotionConceptGroups(parsed.concepts),
    };
  }
  if (isCssModernTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssModernConceptGroups(parsed.concepts),
    };
  }
  if (isCssArchitectureTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withCssArchitectureConceptGroups(parsed.concepts),
    };
  }
  if (isEventsTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withEventsConceptGroups(parsed.concepts),
    };
  }
  if (isNextjsA11ySeoTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withNextjsA11ySeoConceptGroups(parsed.concepts),
    };
  }
  if (isNextjsDataTopicSlug(topic.slug)) {
    return {
      ...parsed,
      concepts: withNextjsDataConceptGroups(parsed.concepts),
    };
  }
  return parsed;
}

export function loadTopicOutline(
  topic: Topic,
  locale: Locale = DEFAULT_LOCALE,
): readonly ConceptOutline[] {
  if (isTypesHubSlug(topic.slug)) {
    return loadTypesHubOutline(topic, locale);
  }
  return loadTopicOutlineSingle(topic, locale);
}

export function loadFileOutline(
  file: string,
  locale: Locale = DEFAULT_LOCALE,
): readonly ConceptOutline[] {
  const { stamp, result } = loadDetailed(file, locale);
  const key = cacheKey(locale, file);
  const store = parseCache().outlines;
  const outlineStamp = `${stamp}|rev:${PARSE_LOGIC_REVISION}`;
  const hit = store.get(key);
  if (hit?.stamp === outlineStamp) {
    return hit.value;
  }
  const value = parseTopicOutline(
    result.markdown,
    locale,
    parseOptionsForFile(file, locale),
  );
  store.set(key, { stamp: outlineStamp, value });
  return value;
}

export async function loadHubPage(
  trackId: TrackId,
  locale: Locale = DEFAULT_LOCALE,
): Promise<
  | {
      file: string;
      parsed: ParsedTopic;
      usedFallback: boolean;
    }
  | undefined
> {
  const file = hubFileForTrack(trackId);
  if (!file) {
    return undefined;
  }
  const loaded = await loadParsedFromFile(file, locale);
  if (loaded.parsed.concepts.length === 0) {
    return undefined;
  }
  return { file, ...loaded };
}

function loadParsedFromFile(
  file: string,
  locale: Locale,
): Promise<{ parsed: ParsedTopic; usedFallback: boolean }> {
  const { stamp, result } = loadDetailed(file, locale);
  const key = cacheKey(locale, file);
  const store = parseCache().parsed;
  const parsedStamp = parsedCacheStamp(stamp, file);
  const hit = store.get(key);
  const pending =
    hit?.stamp === parsedStamp
      ? hit.promise
      : startParsed(store, key, parsedStamp, result.markdown, locale, file);
  const topic = topicForFile(file);
  return pending.then((parsed) => ({
    parsed: topic ? parsedForTopic(topic, parsed) : parsed,
    usedFallback: result.usedFallback,
  }));
}

function parsedCacheStamp(fileStamp: string, file: string): string {
  const hideAnswers = topicForFile(file)?.hideAnswers ? "1" : "0";
  return `${fileStamp}|ha:${hideAnswers}|rev:${PARSE_LOGIC_REVISION}`;
}

export function clearTopicParseCache(): void {
  const store = globalForParse.__topicParseCache;
  if (!store) {
    return;
  }
  store.parsed.clear();
  store.outlines.clear();
  store.markdown.clear();
}

function startParsed(
  store: Map<string, ParsedEntry>,
  key: string,
  stamp: string,
  markdown: string,
  locale: Locale,
  file: string,
): Promise<ParsedTopic> {
  const promise = parseTopicMarkdown(
    markdown,
    locale,
    parseOptionsForFile(file, locale),
  );
  store.set(key, { stamp, promise });
  promise.catch(() => {
    const current = store.get(key);
    if (current?.promise === promise) {
      store.delete(key);
    }
  });
  return promise;
}

export const loadParsedTopic = cache(
  async (
    topic: Topic,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<ParsedTopic> => {
    const loaded = await loadParsedFromFile(topic.file, locale);
    return loaded.parsed;
  },
);

export const loadTopicPage = cache(
  async (
    track: string,
    slug: string,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<
    | {
        topic: Topic;
        parsed: ParsedTopic;
        usedFallback: boolean;
      }
    | undefined
  > => {
    const topic = getTopic(track, slug);
    if (!topic) {
      return undefined;
    }
    const loaded = await loadParsedFromFile(topic.file, locale);
    return {
      topic,
      parsed: loaded.parsed,
      usedFallback: loaded.usedFallback,
    };
  },
);

export const loadTypesHubConcepts = cache(
  async (
    track: string,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<readonly Concept[] | undefined> => {
    return loadGroupedHubConcepts(
      track,
      locale,
      TYPES_HUB_SLUG,
      TYPES_HUB_REFERENCE_GROUP,
      TYPES_HUB_SECTIONS,
    );
  },
);

async function loadGroupedHubConcepts(
  track: string,
  locale: Locale,
  hubSlug: string,
  referenceGroup: string,
  sections: readonly { readonly slug: string; readonly group: string }[],
): Promise<readonly Concept[] | undefined> {
  const hub = await loadTopicPage(track, hubSlug, locale);
  if (!hub) {
    return undefined;
  }
  const merged: Concept[] = withConceptGroup(
    hub.parsed.concepts,
    referenceGroup,
  );
  for (const section of sections) {
    const child = await loadTopicPage(track, section.slug, locale);
    if (!child) {
      continue;
    }
    merged.push(...withConceptGroup(child.parsed.concepts, section.group));
  }
  return merged;
}

export function topicUsesGroupedConceptIndex(
  topic: Pick<Topic, "slug">,
): boolean {
  return isTypesHubSlug(topic.slug);
}

export function assertCatalogFilesExist(locale: Locale = DEFAULT_LOCALE): void {
  for (const topic of TOPICS) {
    readTopicFile(topic.file, locale);
  }
}
