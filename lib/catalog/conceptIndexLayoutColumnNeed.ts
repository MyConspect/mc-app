/** Subject hub cluster sections eligible for one track per header. */
export const CONCEPT_INDEX_CLUSTER_HUB_SECTION_CAP = 6;

export type ConceptIndexLayoutColumnNeedOptions = {
  /**
   * When true (default), cluster subject hubs with ≤6 sections may request one
   * track per section h2. When false, pack by pane height only (focused
   * multi-topic cluster topic groups flow in shared columns).
   */
  readonly oneTrackPerEntry?: boolean;
  /** Accurate packing weight for nested cluster lists (headings ≈ 2 rows). */
  readonly totalListWeight?: number;
  /** Index rows counted for column need (bulleted links). */
  readonly indexListRowCount?: number;
  /** Nested topic group headings (`h3`) in the focused cluster. */
  readonly indexGroupHeadingCount?: number;
};

/** Width cap × content height, with extra tracks for small cluster hubs. */
export function conceptIndexLayoutColumnNeed(
  widthCapacity: number,
  heightCapacity: number,
  entryCount: number,
  options?: ConceptIndexLayoutColumnNeedOptions,
): number {
  let need = Math.max(1, heightCapacity);
  const oneTrackPerEntry = options?.oneTrackPerEntry !== false;
  if (oneTrackPerEntry && widthCapacity >= 2 && entryCount >= 2) {
    need = Math.max(need, 2);
  }
  if (
    oneTrackPerEntry &&
    entryCount > 1 &&
    entryCount <= CONCEPT_INDEX_CLUSTER_HUB_SECTION_CAP &&
    entryCount <= widthCapacity
  ) {
    need = Math.max(need, entryCount);
  }
  return Math.min(widthCapacity, need);
}
