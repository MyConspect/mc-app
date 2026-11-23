import { DATABASE_NOSQL_CORE_SLUG } from "@/lib/catalog/databaseNosqlIntro";
import type { ConceptOutline } from "@/lib/parse";
import {
  areRedundantNavTitles,
  isRedundantTopicConceptTitle,
} from "./navUtils";
import type { NavConcept } from "./types";

function dropRedundantNosqlIntroGroup(
  topicSlug: string | undefined,
  label: string,
): boolean {
  return (
    topicSlug === DATABASE_NOSQL_CORE_SLUG &&
    /^nosql\s+foundations$/i.test(label.trim())
  );
}

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
  topicTitle?: string,
  topicSlug?: string,
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

  return groups
    .filter(({ label }) => !dropRedundantNosqlIntroGroup(topicSlug, label))
    .map(({ label, concepts: items }) => ({
      label,
      concepts: items.filter(
        (concept) =>
          !isRedundantTopicConceptTitle(label, concept.title) &&
          !(
            topicTitle != null &&
            areRedundantNavTitles(topicTitle, concept.title)
          ),
      ),
    }));
}