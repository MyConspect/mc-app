import { conceptMatchesQuery } from "./search";
import type { NavConcept, SearchMode } from "./types";

export function compactConceptId(id: string): string {
  return id.replace(/-/g, "");
}

/** Map a URL hash to a concept id (exact, then unique hyphen-insensitive match). */
export function resolveConceptId(
  hashId: string,
  concepts: readonly { readonly id: string }[],
): string {
  if (!hashId) {
    return "";
  }
  if (concepts.some((concept) => concept.id === hashId)) {
    return hashId;
  }
  const compact = compactConceptId(hashId);
  if (!compact) {
    return "";
  }
  const matches = concepts.filter(
    (concept) => compactConceptId(concept.id) === compact,
  );
  if (matches.length === 1) {
    return matches[0]?.id ?? "";
  }
  if (compact.length < 12) {
    return "";
  }
  const prefixes = concepts.filter((concept) => {
    const other = compactConceptId(concept.id);
    return compact.startsWith(other) || other.startsWith(compact);
  });
  if (prefixes.length === 1) {
    return prefixes[0]?.id ?? "";
  }
  return "";
}

type SearchableConcept = Pick<
  NavConcept,
  "id" | "title" | "titleSearchText" | "searchText"
>;

/**
 * Hash to open for the current query.
 * Returns null when the current hash should stay.
 * A hash already in the URL is kept until the query is edited this visit.
 */
export function nextConceptHash(input: {
  readonly concepts: readonly SearchableConcept[];
  readonly query: string;
  readonly mode: SearchMode;
  readonly currentHash: string;
  readonly arrivalHash: string;
  readonly queryEdited: boolean;
}): string | null {
  const needle = input.query.trim().toLowerCase();
  if (needle.length === 0) {
    return null;
  }
  if (input.arrivalHash.length > 0 && !input.queryEdited) {
    return null;
  }
  const currentId = resolveConceptId(input.currentHash, input.concepts);
  const hashConcept = input.concepts.find(
    (concept) => concept.id === currentId,
  );
  if (hashConcept && conceptMatchesQuery(hashConcept, needle, input.mode)) {
    return null;
  }
  const match = input.concepts.find((concept) =>
    conceptMatchesQuery(concept, needle, input.mode),
  );
  return match?.id ?? null;
}
