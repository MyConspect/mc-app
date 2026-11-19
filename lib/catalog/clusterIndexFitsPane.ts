import type { SubjectClusterSection } from "./clusterConceptIndex";
import {
  CONCEPT_INDEX_PANE_USABLE_RATIO,
  CONCEPT_INDEX_WEIGHT_ROW_PX,
} from "./conceptIndexColumnMetrics";

/** Packing weight for a cluster index section (headings ≈ 2 rows). */
export function clusterSectionListWeight(
  section: SubjectClusterSection,
): number {
  let weight = section.cluster.title.trim().length > 0 ? 2 : 0;
  for (const item of section.items) {
    weight += item.indexRowKind === "group-heading" ? 2 : 1;
  }
  return weight;
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