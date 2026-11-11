import { escapeHtml, slotLabelHtml } from "./slot-icons";
import { transformMarkdownTables } from "./table-scroll";
import { behaviorSlotLabel } from "@/lib/i18n/behaviorQuestions";
import type { Locale } from "@/lib/i18n/locales";

/** Notes flag: Quick keeps the full concept; only **Detailed:** goes in the Detailed pane. */
export const CONCEPT_DEPTH_OPTIONAL_MARKER =
  /<!--\s*concept-depth:optional\s*-->/;

export function hasConceptOptionalDepth(markdown: string): boolean {
  return CONCEPT_DEPTH_OPTIONAL_MARKER.test(markdown);
}

export type SlotKind =
  | "definition"
  | "how"
  | "detailed"
  | "cases"
  | "avoid"
  | "tradeoffs"
  | "example"
  | "thoughts"
  | "sources"
  | "pitfalls"
  | "traps"
  | "key"
  | "advices"
  | "interviewQuestions"
  | "intro"
  | "extra";

type MarkerMatch = {
  readonly index: number;
  readonly length: number;
  readonly rawLabel: string;
  readonly inline: string;
  readonly kind: SlotKind;
};

const SLOT_DISPLAY: Record<
  Exclude<SlotKind, "intro" | "extra" | "pitfalls">,
  string
> = {
  definition: "Definition",
  how: "How it works",
  detailed: "Detailed",
  cases: "When to use",
  avoid: "When not to use",
  tradeoffs: "Pluses and minuses",
  example: "Examples",
  thoughts: "Thoughts",
  sources: "Sources",
  interviewQuestions: "Interview questions",
  traps: "TRAPS",
  key: "Key",
  advices: "Advices",
};

const SLOT_ORDER: Record<SlotKind, number> = {
  intro: 0,
  traps: 8,
  key: 12,
  advices: 16,
  definition: 10,
  how: 20,
  detailed: 25,
  cases: 30,
  avoid: 32,
  pitfalls: 35,
  tradeoffs: 40,
  example: 50,
  thoughts: 60,
  extra: 65,
  sources: 70,
  interviewQuestions: 72,
};

// Notes use `**Label:**` (colon before closing bold), not `**Label**:`
const MARKER_LINE_RE = /^\*\*([^*\n]+):\*\*\s*(.*)$/;
const ALT_MARKER_LINE_RE =
  /^\*\*(TRAPS|Advice|Advices|Key|Keys)\*\*\s*:?\s*(.*)$/i;
const ALT_ANSWER_HEADING_RE =
  /^\*\*(Answer|Answear|Example(?: answers| responses)?)\b[^*]*\*\*\s*:?\s*(.*)$/i;
const PROMPT_ANSWER_HEADING_RE =
  /^\*\*(If asked about|If pressed for|General formula for any illegal)/i;

function normalizeLabel(raw: string): string {
  return raw
    .replace(/\s+—.*$/u, "")
    .trim()
    .toLowerCase();
}

function isSkippedSlot(rawLabel: string): boolean {
  const label = normalizeLabel(rawLabel);
  return label === "see also" || label === "related";
}

export function isAnswerSlotLabel(rawLabel: string): boolean {
  const label = normalizeLabel(rawLabel);
  if (label.startsWith("answer") || label.startsWith("answear")) {
    return true;
  }
  if (label.includes("best answer") || label.includes("passable answer")) {
    return true;
  }
  if (
    label.startsWith("example answers") ||
    label.startsWith("example responses")
  ) {
    return true;
  }
  if (
    label.startsWith("if asked about") ||
    label.startsWith("if pressed for") ||
    label.startsWith("general formula for any illegal")
  ) {
    return true;
  }
  return label.startsWith("example");
}

function isAnswerBoundaryLine(line: string): boolean {
  const standard = line.match(MARKER_LINE_RE);
  if (standard && isAnswerSlotLabel(standard[1])) {
    return true;
  }
  return (
    ALT_ANSWER_HEADING_RE.test(line) || PROMPT_ANSWER_HEADING_RE.test(line)
  );
}

export function stripAnswerSections(markdown: string): string {
  const kept: string[] = [];
  let skipping = false;

  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "---") {
      if (skipping) {
        skipping = false;
      }
      continue;
    }
    if (isAnswerBoundaryLine(line)) {
      skipping = true;
      continue;
    }
    if (!skipping) {
      kept.push(line);
    }
  }

  return kept.join("\n").trim();
}

function classifyMarker(rawLabel: string): SlotKind {
  const label = normalizeLabel(rawLabel);
  if (label === "traps") {
    return "traps";
  }
  if (label === "key" || label === "keys" || label === "simple summary") {
    return "key";
  }
  if (label === "advice" || label === "advices") {
    return "advices";
  }
  if (label === "definition") {
    return "definition";
  }
  if (label === "how it works") {
    return "how";
  }
  if (label === "detailed") {
    return "detailed";
  }
  if (label.startsWith("when not to use")) {
    return "avoid";
  }
  if (label === "cases" || label === "when to use") {
    return "cases";
  }
  if (
    label === "example" ||
    label === "examples" ||
    label.startsWith("example")
  ) {
    return "example";
  }
  if (label.includes("pitfall")) {
    return "pitfalls";
  }
  if (label === "thoughts" || label === "key idea") {
    return "thoughts";
  }
  if (label === "source" || label === "sources") {
    return "sources";
  }
  if (label === "interview questions" || label === "interview question") {
    return "interviewQuestions";
  }
  if (
    label === "pros" ||
    label === "cons" ||
    label.startsWith("pros ") ||
    label.startsWith("cons ") ||
    label.includes("pros & cons") ||
    label.includes("pros and cons") ||
    label.includes("pluses and minuses") ||
    label.includes("pluses & minuses")
  ) {
    return "tradeoffs";
  }
  return "extra";
}

function displayLabel(
  kind: SlotKind,
  rawLabel: string,
  locale?: Locale,
): string {
  const localized = locale ? behaviorSlotLabel(locale, kind) : undefined;
  if (localized) {
    return localized;
  }
  if (kind === "intro" || kind === "extra" || kind === "pitfalls") {
    return stripMdLabel(rawLabel);
  }
  if (kind === "key" || kind === "advices" || kind === "traps") {
    return SLOT_DISPLAY[kind];
  }
  return (
    SLOT_DISPLAY[kind as keyof typeof SLOT_DISPLAY] ?? stripMdLabel(rawLabel)
  );
}

function stripMdLabel(raw: string): string {
  return raw.replace(/\s+—.*$/u, "").trim();
}

function markerFromLine(
  line: string,
): Omit<MarkerMatch, "index" | "length"> | undefined {
  const standard = line.match(MARKER_LINE_RE);
  if (standard) {
    return {
      rawLabel: standard[1],
      inline: standard[2].trim(),
      kind: classifyMarker(standard[1]),
    };
  }
  const alternate = line.match(ALT_MARKER_LINE_RE);
  if (alternate) {
    return {
      rawLabel: alternate[1],
      inline: alternate[2].trim(),
      kind: classifyMarker(alternate[1]),
    };
  }
  return undefined;
}

function findMarkers(markdown: string): MarkerMatch[] {
  const markers: MarkerMatch[] = [];
  let lineStart = 0;

  while (lineStart < markdown.length) {
    const lineEnd = markdown.indexOf("\n", lineStart);
    const end = lineEnd === -1 ? markdown.length : lineEnd;
    const line = markdown.slice(lineStart, end);
    const match = markerFromLine(line);
    if (match) {
      markers.push({
        index: lineStart,
        length: end - lineStart + (lineEnd === -1 ? 0 : 1),
        ...match,
      });
    }
    lineStart = lineEnd === -1 ? markdown.length : lineEnd + 1;
  }

  return markers;
}

function splitByMarkers(
  markdown: string,
): { kind: SlotKind; rawLabel: string; body: string }[] {
  const markers = findMarkers(markdown);
  if (markers.length === 0) {
    const trimmed = markdown.trim();
    return trimmed ? [{ kind: "intro", rawLabel: "", body: trimmed }] : [];
  }

  const sections: { kind: SlotKind; rawLabel: string; body: string }[] = [];
  const preamble = markdown.slice(0, markers[0].index).trim();
  if (preamble) {
    sections.push({ kind: "intro", rawLabel: "", body: preamble });
  }

  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    const nextIndex =
      i + 1 < markers.length ? markers[i + 1].index : markdown.length;
    const chunk = markdown
      .slice(marker.index + marker.length, nextIndex)
      .trim();
    const body = marker.inline
      ? chunk
        ? `${marker.inline}\n\n${chunk}`
        : marker.inline
      : chunk;
    if (body.trim()) {
      sections.push({ kind: marker.kind, rawLabel: marker.rawLabel, body });
    }
  }

  return sections;
}

type ConceptSection = { kind: SlotKind; rawLabel: string; body: string };

function isDetailedDepthSlot(section: ConceptSection): boolean {
  if (section.kind === "detailed") {
    return true;
  }
  return (
    section.kind === "extra" && normalizeLabel(section.rawLabel) === "detailed"
  );
}

function pitfallsMarkdown(section: ConceptSection): string {
  const title = stripMdLabel(section.rawLabel);
  const body = section.body.trim();
  return body ? `#### ${title}\n\n${body}` : `#### ${title}`;
}

function mergeDuplicateKinds(sections: ConceptSection[]): ConceptSection[] {
  const merged: ConceptSection[] = [];
  const indexByKey = new Map<string, number>();

  for (const section of sections) {
    const key =
      section.kind === "extra" ||
      section.kind === "cases" ||
      section.kind === "avoid"
        ? `${section.kind}:${normalizeLabel(section.rawLabel)}`
        : section.kind;
    const existingIndex = indexByKey.get(key);
    if (existingIndex === undefined) {
      indexByKey.set(key, merged.length);
      merged.push(section);
      continue;
    }
    const existing = merged[existingIndex];
    merged[existingIndex] = {
      ...existing,
      body: `${existing.body}\n\n${section.body}`.trim(),
    };
  }

  return merged;
}

function stripHeadingText(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

type ConceptPart = {
  readonly heading: string;
  readonly markdown: string;
};

function splitBySubheadings(markdown: string): ConceptPart[] {
  const parts: { heading: string; lines: string[] }[] = [];
  let current = { heading: "", lines: [] as string[] };
  let inFence = false;

  for (const line of markdown.split("\n")) {
    const fence = line.trimStart().startsWith("```");
    if (fence) {
      inFence = !inFence;
      current.lines.push(line);
      continue;
    }

    const headingMatch = !inFence ? line.match(/^#{2,3}\s+(.+)$/) : undefined;
    if (headingMatch) {
      if (current.heading || current.lines.some((entry) => entry.trim())) {
        parts.push(current);
      }
      current = { heading: stripHeadingText(headingMatch[1]), lines: [] };
      continue;
    }

    current.lines.push(line);
  }

  if (current.heading || current.lines.some((entry) => entry.trim())) {
    parts.push(current);
  }

  return parts.map((part) => ({
    heading: part.heading,
    markdown: part.lines.join("\n").trim(),
  }));
}

function sectionsForMarkdown(
  markdown: string,
  hideAnswers = false,
  preserveDocumentOrder = false,
): ConceptSection[] {
  const sections = mergeDuplicateKinds(
    mergePitfallsIntoCases(splitByMarkers(markdown)),
  ).filter(
    (section) =>
      !isSkippedSlot(section.rawLabel) &&
      !(hideAnswers && isAnswerSlotLabel(section.rawLabel)),
  );
  return preserveDocumentOrder ? sections : orderSectionsForRender(sections);
}

type WrapPartOptions = {
  /** Part has no Quick slots — show only when handbook depth is Detailed. */
  readonly detailedOnly?: boolean;
};

function wrapPart(
  heading: string,
  slotsHtml: string,
  options?: WrapPartOptions,
): string {
  if (!slotsHtml.trim() && !heading) {
    return "";
  }
  const title = heading
    ? `<h3 class="concept-part__title">${escapeHtml(heading)}</h3>`
    : "";
  const className = options?.detailedOnly
    ? "concept-part concept-part--detailed-only"
    : "concept-part";
  return `<section class="${className}">${title}${slotsHtml}</section>`;
}

function mergePitfallsIntoCases(sections: ConceptSection[]): ConceptSection[] {
  const merged: ConceptSection[] = [];
  let pendingPitfalls: ConceptSection[] = [];

  function flushPitfallsIntoCases(casesIndex: number) {
    if (pendingPitfalls.length === 0) {
      return;
    }
    const cases = merged[casesIndex];
    const blocks = pendingPitfalls.map(pitfallsMarkdown).join("\n\n");
    merged[casesIndex] = {
      ...cases,
      body: `${cases.body}\n\n${blocks}`.trim(),
    };
    pendingPitfalls = [];
  }

  for (const section of sections) {
    if (section.kind === "pitfalls") {
      pendingPitfalls.push(section);
      continue;
    }

    merged.push(section);

    if (section.kind === "cases") {
      flushPitfallsIntoCases(merged.length - 1);
    }
  }

  if (pendingPitfalls.length > 0) {
    const lastCasesIndex = merged.findLastIndex(
      (item) => item.kind === "cases",
    );
    if (lastCasesIndex >= 0) {
      flushPitfallsIntoCases(lastCasesIndex);
    } else {
      merged.push({
        kind: "cases",
        rawLabel: "When to use",
        body: pendingPitfalls.map(pitfallsMarkdown).join("\n\n"),
      });
    }
  }

  return merged;
}

function orderSectionsForRender(sections: ConceptSection[]): ConceptSection[] {
  return [...sections].sort((a, b) => SLOT_ORDER[a.kind] - SLOT_ORDER[b.kind]);
}

/** Intro slot that only carries a legacy in-body anchor (concept id is on `<article>`). */
function isAnchorOnlyIntroHtml(kind: SlotKind, bodyHtml: string): boolean {
  if (kind !== "intro") {
    return false;
  }
  const trimmed = bodyHtml.replace(/<!--[\s\S]*?-->/g, "").trim();
  return /^<p>\s*<a\b[^>]*>\s*<\/a>\s*<\/p>\s*$/i.test(trimmed);
}

type RenderSectionsOptions = {
  /** Slot kinds that render body only (no icon / heading label). */
  readonly omitLabelKinds?: ReadonlySet<SlotKind>;
};

function wrapSlot(
  kind: SlotKind,
  rawLabel: string,
  bodyHtml: string,
  locale?: Locale,
  options?: RenderSectionsOptions,
): string {
  if (!bodyHtml.trim()) {
    return "";
  }
  const omitLabel = options?.omitLabelKinds?.has(kind) ?? false;
  const labelHtml =
    kind === "intro" || omitLabel
      ? ""
      : slotLabelHtml(kind, displayLabel(kind, rawLabel, locale));
  return `<section class="concept-slot slot-${kind}">${labelHtml}<div class="concept-slot__body">${bodyHtml}</div></section>`;
}

async function renderSections(
  sections: readonly ConceptSection[],
  renderFragment: (fragment: string) => Promise<string>,
  locale?: Locale,
  options?: RenderSectionsOptions,
): Promise<string> {
  const rendered = await Promise.all(
    sections.map(async (section) => {
      const bodyHtml = transformMarkdownTables(
        await renderFragment(section.body),
      );
      if (isAnchorOnlyIntroHtml(section.kind, bodyHtml)) {
        return "";
      }
      return wrapSlot(
        section.kind,
        section.rawLabel,
        bodyHtml,
        locale,
        options,
      );
    }),
  );
  return rendered.filter(Boolean).join("\n");
}

export type StructureConceptBodyOptions = {
  readonly hideAnswers?: boolean;
  readonly locale?: Locale;
};

export async function structureConceptBody(
  markdown: string,
  renderFragment: (fragment: string) => Promise<string>,
  options: StructureConceptBodyOptions = {},
): Promise<string> {
  const hideAnswers = options.hideAnswers ?? false;
  const locale = options.locale;
  const source = hideAnswers ? stripAnswerSections(markdown) : markdown;
  if (!source.trim()) {
    return "";
  }

  const optionalDepth = hasConceptOptionalDepth(source);
  const cleanedSource = optionalDepth
    ? source.replace(CONCEPT_DEPTH_OPTIONAL_MARKER, "").trim()
    : source;
  const parts = splitBySubheadings(cleanedSource);
  if (parts.length === 0) {
    return "";
  }

  const renderedParts = await Promise.all(
    parts.map(async (part) => {
      const sections = sectionsForMarkdown(part.markdown, hideAnswers);
      const { quick, detailed } = splitSectionsForConceptDepth(
        sections,
        optionalDepth,
      );
      const quickHtml =
        optionalDepth && quick.length > 0
          ? `<div class="concept-depth-quick">${await renderSections(quick, renderFragment, locale)}</div>`
          : await renderSections(quick, renderFragment, locale);
      const detailedRenderOptions: RenderSectionsOptions | undefined =
        optionalDepth
          ? { omitLabelKinds: new Set<SlotKind>(["detailed"]) }
          : undefined;
      const detailedHtml =
        detailed.length > 0
          ? `<div class="concept-depth-detailed">${await renderSections(
              detailed,
              renderFragment,
              locale,
              detailedRenderOptions,
            )}</div>`
          : "";
      const detailedOnly =
        optionalDepth && quick.length === 0 && detailed.length > 0;
      return wrapPart(part.heading, `${quickHtml}${detailedHtml}`, {
        detailedOnly,
      });
    }),
  );

  return renderedParts.filter(Boolean).join("\n");
}

function splitSectionsForConceptDepth(
  sections: ConceptSection[],
  optionalDepth: boolean,
): { quick: ConceptSection[]; detailed: ConceptSection[] } {
  if (!optionalDepth) {
    return { quick: sections, detailed: [] };
  }
  const quick = sections.filter((section) => !isDetailedDepthSlot(section));
  const detailed = sections.filter((section) => isDetailedDepthSlot(section));
  return { quick, detailed };
}
