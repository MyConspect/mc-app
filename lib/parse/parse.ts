import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { hrefForFile } from "@/lib/catalog";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import { highlightMarkdownFences } from "./highlight";
import {
  structureConceptBody,
  stripAnswerSections,
  hasConceptOptionalDepth,
} from "./slots";

export type InterviewSection = "questions" | "tasks";

export type ParseOptions = {
  readonly hideAnswers?: boolean;
  readonly locale?: Locale;
  /** English twin markdown — stable interview question anchors for non-default locales. */
  readonly anchorMarkdown?: string;
};

export type Concept = {
  readonly id: string;
  readonly title: string;
  readonly html: string;
  readonly searchText?: string;
  readonly titleSearchText?: string;
  readonly interviewSection?: InterviewSection;
  readonly group?: string;
  readonly hasOptionalDepth?: boolean;
};

export type ConceptBlock = {
  readonly title: string;
  readonly body: string;
  readonly group?: string;
};

export type ParsedTopic = {
  readonly title: string;
  readonly description: string;
  readonly concepts: readonly Concept[];
};

const SKIP_TITLES = new Set([
  "code",
  "primary references",
  "tools & utilities",
  "figma templates & design references",
  "website examples & student tutorials",
  "related docs",
  "related docs in this repo",
  "related notes",
  "main concepts",
  "sections",
  "navigation",
  "resources & links",
  "resources",
  "core advanced",
]);

const CONCEPT_MARKERS = [
  "**Definition:**",
  "**How it works:**",
  "**When to use:**",
  "**Thoughts:**",
  "**Key idea:**",
];

marked.setOptions({ gfm: true, breaks: false });

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    ...(sanitizeHtml.defaults.allowedTags ?? []),
    "details",
    "summary",
    "img",
    "h1",
    "h2",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "pre",
    "code",
    "span",
    "div",
    "hr",
    "caption",
    "colgroup",
    "col",
    "section",
    "aside",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "id", "target", "rel", "title"],
    details: ["open", "id"],
    summary: ["id"],
    img: ["src", "alt", "title", "width", "height"],
    td: ["colspan", "rowspan", "align"],
    th: ["colspan", "rowspan", "align"],
    code: ["class", "style"],
    pre: ["class", "style", "tabindex"],
    span: ["class", "style"],
    "*": ["id", "class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  parseStyleAttributes: false,
};

export type ConceptOutline = {
  readonly id: string;
  readonly title: string;
  readonly searchText?: string;
  readonly titleSearchText?: string;
  readonly interviewSection?: InterviewSection;
  readonly group?: string;
};

const CONCEPT_SEARCH_TEXT_MAX = 1600;

export function extractInterviewAnchorTitles(
  markdown: string,
): readonly string[] {
  const rewritten = rewriteNoteLinks(markdown, DEFAULT_LOCALE);
  const { interview } = partitionInterviewBlocks(rewritten);
  return orderedInterviewBlocks(interview).map((block) => {
    const interviewSection = interviewSectionForTitle(block.title);
    return cleanInterviewTitle(block.title, interviewSection);
  });
}

export function parseTopicOutline(
  markdown: string,
  locale: Locale = DEFAULT_LOCALE,
  options: ParseOptions = {},
): readonly ConceptOutline[] {
  const rewritten = rewriteNoteLinks(markdown, locale);
  const { regular, interview } = partitionInterviewBlocks(rewritten);
  const anchorTitles = options.anchorMarkdown
    ? extractInterviewAnchorTitles(options.anchorMarkdown)
    : undefined;
  const usedIds = new Set<string>();
  const hideAnswers = options.hideAnswers ?? false;
  const outline: ConceptOutline[] = regular.map((block) => ({
    id: uniqueId(slugify(block.title), usedIds),
    title: block.title,
    searchText: outlineSearchText(block.body, hideAnswers),
    ...(block.group ? { group: block.group } : {}),
  }));
  for (const item of interviewOutlineItems(
    interview,
    usedIds,
    anchorTitles,
    hideAnswers,
  )) {
    outline.push(item);
  }
  return outline;
}

export async function parseTopicMarkdown(
  markdown: string,
  locale: Locale = DEFAULT_LOCALE,
  options: ParseOptions = {},
): Promise<ParsedTopic> {
  const rewritten = rewriteNoteLinks(markdown, locale);
  const title = extractH1(rewritten) ?? "Topic";
  const description = extractDescription(rewritten);
  const concepts = await collectConcepts(rewritten, options);
  return { title, description, concepts };
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return slug || "section";
}

function compactSlug(id: string): string {
  return id.replace(/-/g, "");
}

/** Align a markdown hash with `slugify(link text)` when it is clearly the same concept. */
export function canonicalLinkHash(
  linkText: string,
  hash: string | undefined,
): string | undefined {
  if (!hash) {
    return undefined;
  }
  const raw = hash.replace(/^#/, "");
  if (!raw) {
    return undefined;
  }
  const fromText = slugify(linkText);
  if (raw === fromText) {
    return `#${raw}`;
  }
  const compactRaw = compactSlug(raw);
  const compactText = compactSlug(fromText);
  if (compactRaw === compactText) {
    return `#${fromText}`;
  }
  if (raw.startsWith("q-") && fromText.length >= 12) {
    return `#${fromText}`;
  }
  if (fromText.length === 96 && compactRaw.startsWith(compactText)) {
    return `#${fromText}`;
  }
  return `#${raw}`;
}

function rewriteNoteLinks(markdown: string, locale: Locale): string {
  const mdLinks =
    /\[([^\]]+)\]\((?:\.\.\/)?(?:\.\/)?(\d+_[a-z0-9_]+\.md)(#[^)\s]*)?\)/gi;
  const hrefs = /href="(?:\.\.\/)?(?:\.\/)?(\d+_[a-z0-9_]+\.md)(#[^"]*)?"/gi;

  const replaceFile = (
    file: string,
    hash: string | undefined,
  ): string | undefined => {
    const href = hrefForFile(file);
    if (!href) {
      return undefined;
    }
    return withLocale(locale, `${href}${hash ?? ""}`);
  };

  return markdown
    .replace(
      mdLinks,
      (full, text: string, file: string, hash?: string) => {
        const next = replaceFile(file, canonicalLinkHash(text, hash));
        return next ? `[${text}](${next})` : full;
      },
    )
    .replace(hrefs, (full, file: string, hash?: string) => {
      const next = replaceFile(file, hash);
      return next ? `href="${next}"` : full;
    });
}

function extractH1(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripMd(match[1]) : undefined;
}

function extractDescription(markdown: string): string {
  const withoutTitle = markdown.replace(/^#\s+.+$/m, "");
  const lines = withoutTitle.split(/\n/);
  const chunks: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (chunks.length > 0) {
        break;
      }
      continue;
    }
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("<") ||
      trimmed.startsWith("|") ||
      trimmed.startsWith("[←") ||
      trimmed.startsWith("### ")
    ) {
      if (chunks.length > 0) {
        break;
      }
      continue;
    }
    chunks.push(trimmed);
    if (chunks.join(" ").length > 40) {
      break;
    }
  }
  const text = stripMd(chunks.join(" "));
  return text.slice(0, 280) || "Study notes.";
}

type LocatedBlock = {
  readonly title: string;
  readonly body: string;
  readonly start: number;
  readonly group?: string;
};

export function collectConceptBlocks(markdown: string): ConceptBlock[] {
  return collectLocatedBlocks(markdown).map(({ title, body, group }) => ({
    title,
    body,
    ...(group ? { group } : {}),
  }));
}

async function collectConcepts(
  markdown: string,
  options: ParseOptions = {},
): Promise<Concept[]> {
  const { regular, interview } = partitionInterviewBlocks(markdown);
  const anchorTitles = options.anchorMarkdown
    ? extractInterviewAnchorTitles(options.anchorMarkdown)
    : undefined;
  const usedIds = new Set<string>();
  const regularConcepts = regular.map((block) => {
    const id = uniqueId(slugify(block.title), usedIds);
    const body = options.hideAnswers
      ? stripAnswerSections(block.body)
      : block.body;
    const searchText = conceptSearchText(body);
    return renderHtml(block.body, options).then(
      (html): Concept => ({
        id,
        title: block.title,
        html,
        searchText,
        ...(block.group ? { group: block.group } : {}),
        ...(hasConceptOptionalDepth(body) ? { hasOptionalDepth: true } : {}),
      }),
    );
  });
  const interviewConcepts = interviewConceptItems(
    interview,
    usedIds,
    (block) =>
      renderHtml(stripDuplicateHeadingsInDetails(block.body), options),
    anchorTitles,
    options.hideAnswers ?? false,
  );
  const [renderedRegular, renderedInterview] = await Promise.all([
    Promise.all(regularConcepts),
    interviewConcepts,
  ]);
  return [...renderedRegular, ...renderedInterview];
}

function partitionInterviewBlocks(markdown: string): {
  regular: ConceptBlock[];
  interview: ConceptBlock[];
} {
  const regionStart = interviewRegionStart(studyMarkdown(markdown));
  const regular: ConceptBlock[] = [];
  const interview: ConceptBlock[] = [];
  for (const block of collectLocatedBlocks(markdown)) {
    const item = {
      title: block.title,
      body: block.body,
      ...(block.group ? { group: block.group } : {}),
    };
    if (
      isInterviewNavItem(block.title) ||
      (regionStart !== -1 && block.start >= regionStart)
    ) {
      interview.push(item);
    } else {
      regular.push(item);
    }
  }
  return { regular, interview };
}

function interviewRegionStart(markdown: string): number {
  const heading = markdown.search(
    /^#{2,3}\s+(?:Interview (?:Practice|questions)|Questions?\s*(?:&|and)\s*Answers?|Q&A)\s*$/im,
  );
  const summary = markdown.search(
    /<summary>\s*(?:Interview (?:Practice|questions)|Questions?\s*(?:&|and)\s*Answers?)\s*<\/summary>/i,
  );
  const hits = [heading, summary].filter((index) => index >= 0);
  return hits.length === 0 ? -1 : Math.min(...hits);
}

function isInterviewNavItem(title: string): boolean {
  return isInterviewSectionTitle(title) || isInterviewQuestionTitle(title);
}

function isInterviewSectionTitle(title: string): boolean {
  const t = normalizeTitle(title);
  return (
    t === "interview practice" ||
    t === "interview questions" ||
    t.startsWith("question index") ||
    t === "theory questions" ||
    t === "questions & answers" ||
    t === "questions and answers" ||
    t === "browser pipeline q&a" ||
    t === "browser pipeline q and a" ||
    t === "original questions" ||
    t.startsWith("original questions") ||
    t === "tasks" ||
    t === "coding tasks" ||
    t.startsWith("quick oral questions") ||
    t === "answers" ||
    t === "solution" ||
    t.startsWith("solution ")
  );
}

function isInterviewTaskTitle(title: string): boolean {
  return /^Task(?:\s+\d+)?\b/i.test(title);
}

function isInterviewQuestionTitle(title: string): boolean {
  return (
    /^(Q\d+[a-z]?|Q-[A-Za-z0-9]+)\b/.test(title) || isInterviewTaskTitle(title)
  );
}

function interviewSectionForTitle(title: string): InterviewSection {
  return isInterviewTaskTitle(title) ? "tasks" : "questions";
}

function cleanInterviewTitle(title: string, section: InterviewSection): string {
  if (section === "tasks") {
    const stripped = title.replace(/^Task\s+\d+[a-z]?\s*[—–-]\s*/i, "").trim();
    return stripped || title;
  }
  const stripped = title
    .replace(/^Q(?:-[A-Za-z0-9]+|\d+[a-z]?)\.\s*/, "")
    .trim();
  return stripped || title;
}

function orderedInterviewBlocks(
  blocks: readonly ConceptBlock[],
): ConceptBlock[] {
  const flat = flattenInterviewBlocks(blocks);
  const questions = flat.filter((block) => !isInterviewTaskTitle(block.title));
  const tasks = flat.filter((block) => isInterviewTaskTitle(block.title));
  return [...questions, ...tasks];
}

function interviewTitleSearchText(
  displayTitle: string,
  anchorTitle: string | undefined,
  rawTitle: string,
): string {
  const parts = [displayTitle];
  if (anchorTitle && anchorTitle !== displayTitle) {
    parts.push(anchorTitle);
  }
  if (
    rawTitle !== displayTitle &&
    rawTitle !== anchorTitle &&
    !parts.includes(rawTitle)
  ) {
    parts.push(rawTitle);
  }
  return parts.join(" ").trim();
}

function warnInterviewAnchorMismatch(
  anchorCount: number,
  blockCount: number,
): void {
  if (anchorCount === blockCount) {
    return;
  }
  if (process.env.NODE_ENV === "production") {
    return;
  }
  console.warn(
    `Interview anchor count mismatch: ${anchorCount} anchors vs ${blockCount} blocks`,
  );
}

function interviewOutlineItems(
  blocks: readonly ConceptBlock[],
  usedIds: Set<string>,
  anchorTitles: readonly string[] | undefined,
  hideAnswers: boolean,
): ConceptOutline[] {
  const ordered = orderedInterviewBlocks(blocks);
  if (anchorTitles) {
    warnInterviewAnchorMismatch(anchorTitles.length, ordered.length);
  }
  return ordered.map((block, index) => {
    const interviewSection = interviewSectionForTitle(block.title);
    const title = cleanInterviewTitle(block.title, interviewSection);
    const anchorTitle = anchorTitles?.[index];
    const idSource = anchorTitle ?? block.title;
    return {
      id: uniqueId(slugify(idSource), usedIds),
      title,
      titleSearchText: interviewTitleSearchText(
        title,
        anchorTitle,
        block.title,
      ),
      searchText: outlineSearchText(block.body, hideAnswers),
      interviewSection,
      ...(block.group ? { group: block.group } : {}),
    };
  });
}

function interviewConceptItems(
  blocks: readonly ConceptBlock[],
  usedIds: Set<string>,
  render: (block: ConceptBlock) => Promise<string>,
  anchorTitles: readonly string[] | undefined,
  hideAnswers: boolean,
): Promise<Concept[]> {
  const ordered = orderedInterviewBlocks(blocks);
  if (anchorTitles) {
    warnInterviewAnchorMismatch(anchorTitles.length, ordered.length);
  }
  const items = ordered.map((block, index) => {
    const interviewSection = interviewSectionForTitle(block.title);
    const anchorTitle = anchorTitles?.[index];
    const idSource = anchorTitle ?? block.title;
    const id = uniqueId(slugify(idSource), usedIds);
    const title = cleanInterviewTitle(block.title, interviewSection);
    const searchText = outlineSearchText(block.body, hideAnswers);
    const bodyForDepth = hideAnswers
      ? stripAnswerSections(block.body)
      : block.body;
    return render(block).then(
      (html): Concept => ({
        id,
        title,
        titleSearchText: interviewTitleSearchText(
          title,
          anchorTitle,
          block.title,
        ),
        html,
        searchText,
        interviewSection,
        ...(block.group ? { group: block.group } : {}),
        ...(hasConceptOptionalDepth(bodyForDepth)
          ? { hasOptionalDepth: true }
          : {}),
      }),
    );
  });
  return Promise.all(items);
}

function isInterviewQuestionBlock(block: ConceptBlock): boolean {
  if (
    isInterviewSectionTitle(block.title) &&
    !isInterviewQuestionTitle(block.title)
  ) {
    return false;
  }
  if (isInterviewQuestionTitle(block.title)) {
    return true;
  }
  return looksLikeConcept(block.body, block.title);
}

function isInterviewCollectionWrapper(block: ConceptBlock): boolean {
  return (
    block.body.includes("<!-- gfe-article-wrapper -->") ||
    block.body.includes("<!-- gfe-section-wrapper -->") ||
    block.body.includes("<!-- interview-group-wrapper -->")
  );
}

function shouldExpandInterviewWrapper(block: ConceptBlock): boolean {
  if (!block.body.includes("<details")) {
    return false;
  }
  if (isInterviewQuestionTitle(block.title)) {
    return false;
  }
  const nested = collectConceptBlocks(block.body);
  if (nested.length === 0) {
    return false;
  }
  if (
    isInterviewCollectionWrapper(block) ||
    isInterviewSectionTitle(block.title)
  ) {
    return nested.some(isInterviewQuestionBlock);
  }
  const questionCount = nested.filter(isInterviewQuestionBlock).length;
  return questionCount > 0 && questionCount >= nested.length / 2;
}

function wrapperGroupName(block: ConceptBlock): string | undefined {
  if (
    isInterviewSectionTitle(block.title) ||
    isInterviewQuestionTitle(block.title)
  ) {
    return block.group;
  }
  return block.title;
}

function flattenInterviewBlocks(
  blocks: readonly ConceptBlock[],
  inheritedGroup?: string,
): ConceptBlock[] {
  const result: ConceptBlock[] = [];
  for (const block of blocks) {
    if (shouldExpandInterviewWrapper(block)) {
      const group = wrapperGroupName(block) ?? inheritedGroup;
      const children = collectConceptBlocks(block.body).map((child) => ({
        ...child,
        ...(child.group || !group ? {} : { group }),
      }));
      result.push(...flattenInterviewBlocks(children, group));
      continue;
    }
    if (isInterviewQuestionBlock(block)) {
      result.push(
        inheritedGroup && !block.group
          ? { ...block, group: inheritedGroup }
          : block,
      );
    }
  }
  return result;
}

function normalizeConceptTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detailsSummaryTitles(markdown: string): Set<string> {
  const titles = new Set<string>();
  for (const match of markdown.matchAll(
    /<summary>\s*([\s\S]*?)\s*<\/summary>/gi,
  )) {
    const title = stripMd(match[1].replace(/<[^>]+>/g, ""));
    if (title) {
      titles.add(normalizeConceptTitle(title));
    }
  }
  return titles;
}

function isDetailsBlockStart(markdown: string, start: number): boolean {
  return /^<details\b/i.test(markdown.slice(start).trimStart());
}

function dropDuplicateHeadingStubs(
  markdown: string,
  blocks: readonly LocatedBlock[],
): LocatedBlock[] {
  const detailsTitles = detailsSummaryTitles(markdown);
  if (detailsTitles.size === 0) {
    return [...blocks];
  }
  return blocks.filter((block) => {
    if (isDetailsBlockStart(markdown, block.start)) {
      return true;
    }
    return !detailsTitles.has(normalizeConceptTitle(block.title));
  });
}

function studyMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  if (!/^---\s*$/.test(lines[0] ?? "")) {
    return markdown;
  }
  const close = lines.findIndex(
    (line, index) => index > 0 && /^---\s*$/.test(line),
  );
  if (close === -1) {
    return markdown;
  }
  return lines
    .slice(close + 1)
    .join("\n")
    .trimStart();
}

function collectLocatedBlocks(markdown: string): LocatedBlock[] {
  markdown = studyMarkdown(markdown);
  const lower = markdown.toLowerCase();
  const blocks: LocatedBlock[] = [];
  let i = 0;
  let currentGroup: string | undefined;
  let heading: { title: string; start: number; body: string[] } | undefined;

  const topicGroup = (title: string): string | undefined => {
    if (shouldSkipTitle(title) || isInterviewSectionTitle(title)) {
      return undefined;
    }
    return title;
  };

  const flushHeading = () => {
    if (!heading) {
      return;
    }
    const title = heading.title;
    const body = stripDuplicateTitleHeading(
      title,
      heading.body.join("\n").trim(),
    );
    if (body && !shouldSkipTitle(title) && looksLikeConcept(body, title)) {
      blocks.push({ title, body, start: heading.start });
      if (
        currentGroup &&
        normalizeTitle(currentGroup) === normalizeTitle(title)
      ) {
        currentGroup = undefined;
      }
    }
    heading = undefined;
  };

  while (i < markdown.length) {
    const detailsAt = detailsOpenAt(markdown, lower, i);
    if (detailsAt !== -1) {
      flushHeading();
      const extracted = readDetailsBlock(markdown, lower, detailsAt);
      if (!extracted) {
        i = detailsAt + 8;
        continue;
      }
      const title = stripMd(extracted.title);
      const body = stripDuplicateTitleHeading(title, extracted.body);
      if (body && !shouldSkipTitle(title) && looksLikeConcept(body, title)) {
        const group =
          currentGroup && normalizeTitle(currentGroup) !== normalizeTitle(title)
            ? currentGroup
            : undefined;
        blocks.push({
          title,
          body,
          start: detailsAt,
          ...(group ? { group } : {}),
        });
      }
      i = extracted.end;
      continue;
    }

    const lineEnd = markdown.indexOf("\n", i);
    const end = lineEnd === -1 ? markdown.length : lineEnd;
    const line = markdown.slice(i, end);
    const h3Match = line.match(/^###\s+(.+)$/);
    const h2Match = line.match(/^##(?!#)\s+(.+)$/);
    const headingMatch = h3Match ?? h2Match;
    if (headingMatch) {
      flushHeading();
      if (h2Match) {
        currentGroup = undefined;
      } else if (h3Match) {
        currentGroup = topicGroup(stripMd(h3Match[1]));
      }
      heading = { title: stripMd(headingMatch[1]), start: i, body: [] };
      i = lineEnd === -1 ? markdown.length : lineEnd + 1;
      continue;
    }
    if (heading) {
      heading.body.push(line);
    }
    if (lineEnd === -1) {
      break;
    }
    i = lineEnd + 1;
  }

  flushHeading();
  return dropDuplicateHeadingStubs(markdown, blocks);
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function shouldSkipTitle(title: string): boolean {
  return SKIP_TITLES.has(title.toLowerCase());
}

function looksLikeConcept(body: string, title: string): boolean {
  if (title.toLowerCase() === "code") {
    return false;
  }
  if (isInterviewTaskTitle(title)) {
    return body.trim().length > 0;
  }
  if (body.includes("**Answer:**") || body.includes("**Problem:**")) {
    return true;
  }
  return (
    CONCEPT_MARKERS.some((marker) => body.includes(marker)) || body.length > 400
  );
}

function detailsOpenAt(source: string, lower: string, from: number): number {
  let pos = from;
  while (pos < source.length && (source[pos] === " " || source[pos] === "\t")) {
    pos += 1;
  }
  if (!lower.startsWith("<details", pos)) {
    return -1;
  }
  const after = lower[pos + 8];
  if (after === ">" || after === " " || after === "\n" || after === "\t") {
    return pos;
  }
  return -1;
}

function readDetailsBlock(
  source: string,
  lower: string,
  open: number,
): { title: string; body: string; end: number } | undefined {
  const openEnd = source.indexOf(">", open);
  if (openEnd === -1) {
    return undefined;
  }

  let depth = 1;
  let pos = openEnd + 1;
  let closeAt = -1;

  while (pos < source.length && depth > 0) {
    const nextOpen = findTag(lower, "<details", pos);
    const nextClose = findCloseDetails(lower, pos);
    if (nextClose === -1) {
      break;
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 8;
    } else {
      depth -= 1;
      if (depth === 0) {
        closeAt = nextClose;
      }
      pos = nextClose + 10;
    }
  }

  if (closeAt === -1) {
    return undefined;
  }

  const inner = source.slice(openEnd + 1, closeAt);
  return {
    title: extractSummary(inner) ?? "Untitled",
    body: stripFirstSummary(inner),
    end: closeAt + 10,
  };
}

function findCloseDetails(lowerSource: string, from: number): number {
  let idx = from;
  while (idx < lowerSource.length) {
    const found = lowerSource.indexOf("</details>", idx);
    if (found === -1) {
      return -1;
    }
    if (found > 0 && lowerSource[found - 1] === "`") {
      idx = found + 10;
      continue;
    }
    return found;
  }
  return -1;
}

function findTag(lowerSource: string, tag: string, from: number): number {
  let idx = from;
  while (idx < lowerSource.length) {
    const found = lowerSource.indexOf(tag, idx);
    if (found === -1) {
      return -1;
    }
    const prev = found === 0 ? "" : lowerSource[found - 1];
    const after = lowerSource[found + tag.length];
    if (
      prev !== "`" &&
      (after === ">" || after === " " || after === "\n" || after === "\t")
    ) {
      return found;
    }
    idx = found + tag.length;
  }
  return -1;
}

function extractSummary(inner: string): string | undefined {
  const match = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
  if (!match) {
    return undefined;
  }
  return stripMd(
    match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function stripFirstSummary(inner: string): string {
  return inner.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, "").trim();
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—−]/g, "-")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingMatchesTitle(title: string, heading: string): boolean {
  const a = normalizeTitle(title);
  const b = normalizeTitle(heading);
  if (a === b) {
    return true;
  }
  if (Math.min(a.length, b.length) < 10) {
    return false;
  }
  return a.includes(b) || b.includes(a);
}

function stripLeadingConceptPreamble(body: string): {
  preamble: string;
  rest: string;
} {
  let rest = body;
  let preamble = "";

  while (rest.length > 0) {
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      preamble += whitespace[0];
      rest = rest.slice(whitespace[0].length);
      continue;
    }

    const anchor = rest.match(/^<a\b[^>]*>\s*<\/a>\s*/i);
    if (anchor) {
      preamble += anchor[0];
      rest = rest.slice(anchor[0].length);
      continue;
    }

    const comment = rest.match(/^<!--[\s\S]*?-->\s*/);
    if (comment) {
      preamble += comment[0];
      rest = rest.slice(comment[0].length);
      continue;
    }

    break;
  }

  return { preamble, rest };
}

function stripDuplicateTitleHeading(title: string, body: string): string {
  const { preamble, rest } = stripLeadingConceptPreamble(body);
  const match = rest.match(/^#{1,3}\s+(.+?)(?:\n+|$)/);
  if (!match) {
    return body;
  }
  if (!headingMatchesTitle(title, stripMd(match[1]))) {
    return body;
  }
  return (preamble + rest.slice(match[0].length)).trimStart();
}

function stripDuplicateHeadingsInDetails(markdown: string): string {
  let text = markdown;
  let changed = true;
  while (changed) {
    changed = false;
    text = text.replace(
      /(<summary>)([\s\S]*?)(<\/summary>\s*(?:<!--[\s\S]*?-->\s*)*)(#{1,3}\s+[^\n]+)(\n+)/gi,
      (full, open, summary, mid, heading, newline) => {
        const summaryTitle = stripMd(summary);
        const headingTitle = stripMd(heading.replace(/^#{1,3}\s+/, ""));
        if (!headingMatchesTitle(summaryTitle, headingTitle)) {
          return full;
        }
        changed = true;
        return `${open}${summary}${mid}${newline}`;
      },
    );
  }
  return text;
}

async function renderFragment(markdown: string): Promise<string> {
  const withCode = await highlightMarkdownFences(markdown);
  const parsed = marked.parse(withCode, { async: false });
  return sanitizeHtml(parsed, SANITIZE);
}

async function renderHtml(
  markdown: string,
  options: ParseOptions = {},
): Promise<string> {
  return structureConceptBody(markdown, renderFragment, options);
}

function stripMd(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function outlineSearchText(body: string, hideAnswers: boolean): string {
  return conceptSearchText(hideAnswers ? stripAnswerSections(body) : body);
}

function conceptSearchText(body: string): string {
  const withoutFences = body.replace(/```[\s\S]*?```/g, "\n");
  const withoutTags = withoutFences.replace(/<[^>]+>/g, " ");
  const withoutHeavySlots = withoutTags.replace(
    /\*\*(?:Examples?|Sources?):\*\*[\s\S]*?(?=\n\*\*[^*]+?:\*\*|$)/gi,
    "\n",
  );
  return stripMd(withoutHeavySlots).slice(0, CONCEPT_SEARCH_TEXT_MAX);
}
