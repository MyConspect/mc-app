import { isConceptGroupSectionId } from "./conceptGroupSection";
import { resolveConceptId } from "./conceptHash";

/**
 * Hash fragment id for sidebar highlights and fold matching.
 * Section dom ids must not be fuzzy-resolved to unrelated concept ids.
 */
export function activeNavHashId(
  rawFragmentId: string,
  topicConcepts: readonly { readonly id: string }[] | null | undefined,
): string {
  if (!rawFragmentId) {
    return "";
  }
  if (isConceptGroupSectionId(rawFragmentId)) {
    return rawFragmentId;
  }
  const resolved = topicConcepts
    ? resolveConceptId(rawFragmentId, topicConcepts)
    : "";
  return resolved || rawFragmentId;
}