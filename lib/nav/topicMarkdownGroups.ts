import type { ConceptOutline } from "@/lib/parse";
import { isRedundantTopicConceptTitle } from "./navUtils";
import type { NavConcept } from "./types";

export function navConceptsFromOutline(
  concepts: readonly ConceptOutline[],
): NavConcept[] {
  return concepts.map((concept) => ({
    id: concept.id,
    title: concept.title,
    ...(concept.group ? { group: concept.group } : {}),
    ...(concept.interviewSection
      ? { interviewSection: concept.interviewSection }
      : {}),
  }));
}

export function groupNavConceptsByMarkdownGroup(
  concepts: readonly NavConcept[],
): { readonly label: string; readonly concepts: NavConcept[] }[] {
  const groups: { label: string; concepts: NavConcept[] }[] = [];
  let current: { label: string; concepts: NavConcept[] } | null = null;

  for (const concept of concepts) {
    const label = concept.group ?? "Overview";
    if (!current || current.label !== label) {
      current = { label, concepts: [] };
      groups.push(current);
    }
    current.concepts.push(concept);
  }

  return groups.map(({ label, concepts: items }) => ({
    label,
    concepts: items.filter(
      (concept) => !isRedundantTopicConceptTitle(label, concept.title),
    ),
  }));
}