import { isConceptGroupSectionId } from "./conceptGroupSection";
import { resolveConceptId } from "./conceptHash";
import { hashIdFrom } from "./navUtils";

export type HandbookConceptSources = {
  readonly pendingHash?: string;
  readonly locationHash?: string;
  readonly domConceptId?: string;
  readonly activeConceptId?: string;
  readonly bootConceptId?: string;
};

/** Normalize a URL hash, bare id, or `dataset.conceptHash` value to a concept id. */
export function conceptIdFromFragment(
  hashOrId: string,
  concepts: readonly { readonly id: string }[],
): string {
  if (!hashOrId) {
    return "";
  }
  const fragment = hashOrId.includes("#")
    ? hashOrId
    : `#${hashOrId}`;
  const raw = hashIdFrom(fragment);
  if (!raw || isConceptGroupSectionId(raw)) {
    return "";
  }
  return resolveConceptId(raw, concepts) || raw;
}

export function readDomHandbookConceptId(): string {
  if (typeof document === "undefined") {
    return "";
  }
  return document.documentElement.dataset.conceptHash ?? "";
}

/**
 * Pick the concept id that should drive main content for the current navigation
 * state. Pending hash wins over committed React state (sidebar optimistic hop).
 * Do not read `document` or `window` here — boot `data-concept-hash` is for CSS
 * only; hashes come from props / `useSyncExternalStore` so SSR matches hydration.
 */
export function resolveHandbookConceptId(
  concepts: readonly { readonly id: string }[],
  sources: HandbookConceptSources,
): string {
  const pending = conceptIdFromFragment(sources.pendingHash ?? "", concepts);
  const location = conceptIdFromFragment(sources.locationHash ?? "", concepts);
  const dom = conceptIdFromFragment(sources.domConceptId ?? "", concepts);
  const active = sources.activeConceptId?.trim() ?? "";
  const boot = sources.bootConceptId?.trim() ?? "";
  const raw = pending || location || dom || active || boot;
  return resolveConceptId(raw, concepts) || raw;
}