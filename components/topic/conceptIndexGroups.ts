import type { ChromeCopy } from "@/lib/nav";
import type { SubjectHubConcept } from "@/lib/catalog/subjectHubConcepts";

export type ConceptGroup = {
  readonly key: string;
  readonly label: string | null;
  readonly concepts: SubjectHubConcept[];
};

function groupLabel(concept: SubjectHubConcept, chrome: ChromeCopy): string | null {
  if (concept.group) {
    return concept.group;
  }
  if (concept.interviewSection === "tasks") {
    return chrome.interviewTasks;
  }
  if (concept.interviewSection === "questions") {
    return chrome.interviewQuestions;
  }
  return null;
}

export function groupConcepts(
  concepts: readonly SubjectHubConcept[],
  groupInterviewSections: boolean,
  chrome: ChromeCopy,
): ConceptGroup[] {
  if (!groupInterviewSections) {
    return [{ key: "default", label: null, concepts: [...concepts] }];
  }

  const groups: ConceptGroup[] = [];
  let current: ConceptGroup | null = null;
  let currentSectionKey: string | null = null;

  for (const concept of concepts) {
    const label = groupLabel(concept, chrome);
    const sectionKey = concept.group
      ? `topic:${concept.group}`
      : `section:${concept.interviewSection ?? "default"}`;
    if (!current || currentSectionKey !== sectionKey) {
      currentSectionKey = sectionKey;
      current = {
        key: `${sectionKey}:${groups.length}`,
        label,
        concepts: [],
      };
      groups.push(current);
    }
    current.concepts.push(concept);
  }

  return groups;
}

/** Skip the umbrella row when it repeats the section heading (e.g. “Work Principles”). */
export function conceptsForIndexSection(
  group: ConceptGroup,
): SubjectHubConcept[] {
  if (!group.label) {
    return [...group.concepts];
  }
  return group.concepts.filter((concept) => concept.title !== group.label);
}

export function conceptIndexSectionWeight(group: ConceptGroup): number {
  const rows = conceptsForIndexSection(group);
  const heading = group.label ? 2 : 0;
  return rows.length + heading;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripInterviewFiller(title: string): string {
  return title
    .replace(/^interview\s*[—–:-]\s*/i, "")
    .replace(/^interview\s+/i, "")
    .replace(/\s+interviews?\b/gi, "")
    .replace(/\binterviews?\s+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripSubjectRedundancy(title: string, subjectTitle: string): string {
  const subject = subjectTitle.trim();
  if (!subject) {
    return title;
  }
  let out = title.trim();
  out = out.replace(new RegExp(`^${escapeRegExp(subject)}\\s+`, "i"), "");
  out = out.replace(new RegExp(`\\s+${escapeRegExp(subject)}\\s+`, "i"), " ");
  out = out.replace(new RegExp(`\\s+${escapeRegExp(subject)}$`, "i"), "");
  if (/^and\s+/i.test(out)) {
    out = out.replace(/^and\s+/i, "");
    if (out.length > 0) {
      out = `${out[0]?.toUpperCase() ?? ""}${out.slice(1)}`;
    }
  }
  return out.trim();
}

/**
 * Short section labels on interview topic pages — drop “Interview” and the
 * subject name when the breadcrumb already names the topic (e.g. JavaScript).
 */
export function interviewGroupDisplayTitle(
  groupLabel: string,
  subjectTitle?: string,
): string {
  const label = groupLabel.trim();
  if (!label) {
    return groupLabel;
  }
  let title = stripInterviewFiller(label);
  if (subjectTitle?.trim()) {
    title = stripSubjectRedundancy(title, subjectTitle);
  }
  return title || label;
}
