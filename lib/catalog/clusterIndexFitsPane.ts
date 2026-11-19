import type { SubjectClusterSection } from "./clusterConceptIndex";
import {
  CONCEPT_INDEX_PANE_USABLE_RATIO,
  CONCEPT_INDEX_WEIGHT_ROW_PX,
} from "./conceptIndexColumnMetrics";

export type ClusterSectionIndexStats = {
  readonly packWeight: number;
  readonly listRowCount: number;
  readonly groupHeadingCount: number;
};

/** Packing weight from row counts (cluster h2, group h3 ≈ 2 rows, links ≈ 1). */
export function conceptIndexClusterIndexPackWeight(
  listRowCount: number,
  groupHeadingCount: number,
  includeClusterTitle: boolean,
): number {
  return (
    (includeClusterTitle ? 2 : 0) + groupHeadingCount * 2 + listRowCount
  );
}

/** Packing weight for a cluster index section (headings ≈ 2 rows). */
export function clusterSectionListWeight(
  section: SubjectClusterSection,
): number {
  return clusterSectionIndexStats(section).packWeight;
}

export function clusterSectionIndexStats(
  section: SubjectClusterSection,
): ClusterSectionIndexStats {
  let listRowCount = 0;
  let groupHeadingCount = 0;
  for (const item of section.items) {
    if (item.indexRowKind === "group-heading") {
      groupHeadingCount += 1;
    } else {
      listRowCount += 1;
    }
  }
  const includeClusterTitle = section.cluster.title.trim().length > 0;
  return {
    listRowCount,
    groupHeadingCount,
    packWeight: conceptIndexClusterIndexPackWeight(
      listRowCount,
      groupHeadingCount,
      includeClusterTitle,
    ),
  };
}

/** Estimated list rows that fit across `columnCount` tracks at pane height. */
export function clusterIndexPaneRowCapacity(
  paneHeightPx: number,
  columnCount = 1,
): number {
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return 0;
  }
  const rowsPerPane = Math.floor(
    (paneHeightPx * CONCEPT_INDEX_PANE_USABLE_RATIO) /
      CONCEPT_INDEX_WEIGHT_ROW_PX,
  );
  if (rowsPerPane < 1) {
    return 0;
  }
  return rowsPerPane * Math.max(1, columnCount);
}

/**
 * Lock multicol height only when packing model has slack (real headings/margins
 * exceed weight rows).
 */
export function clusterIndexShouldLockPaneHeight(
  totalWeight: number,
  paneHeightPx: number,
  columnCount = 1,
): boolean {
  if (!clusterIndexFitsPane(totalWeight, paneHeightPx, columnCount)) {
    return false;
  }
  const capacity = clusterIndexPaneRowCapacity(paneHeightPx, columnCount);
  return capacity > 0 && totalWeight + 8 <= capacity;
}

/** True when list weight fits ~one pane without vertical scroll (optional columns). */
export function clusterIndexFitsPane(
  totalWeight: number,
  paneHeightPx: number,
  columnCount = 1,
): boolean {
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return true;
  }
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return false;
  }
  const rowsPerPane = Math.floor(
    (paneHeightPx * CONCEPT_INDEX_PANE_USABLE_RATIO) /
      CONCEPT_INDEX_WEIGHT_ROW_PX,
  );
  if (rowsPerPane < 1) {
    return false;
  }
  const safeColumns = Math.max(1, columnCount);
  return totalWeight <= rowsPerPane * safeColumns;
}