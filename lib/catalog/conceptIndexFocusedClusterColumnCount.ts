import {
  CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX,
  conceptIndexColumnCountForContentHeight,
  conceptIndexRawColumnCountForWidth,
} from "./conceptIndexColumnMetrics";
import { conceptIndexClusterIndexPackWeight } from "./clusterIndexFitsPane";

export type FocusedClusterIndexCounts = {
  readonly listRowCount: number;
  readonly groupHeadingCount: number;
};

function resolvedPackWeight(
  packWeight: number,
  counts: FocusedClusterIndexCounts | undefined,
): number {
  let weight = Number.isFinite(packWeight) && packWeight > 0 ? packWeight : 0;
  if (
    counts &&
    (counts.listRowCount > 0 || counts.groupHeadingCount > 0)
  ) {
    weight = Math.max(
      weight,
      conceptIndexClusterIndexPackWeight(
        counts.listRowCount,
        counts.groupHeadingCount,
        true,
      ),
    );
  }
  return weight;
}

/** Columns for a focused multi-topic cluster (width + list weight, min 2 when wide). */
export type FocusedClusterColumnCountOptions = {
  readonly viewportWidthPx?: number;
  readonly contentWidthPx?: number;
  /** One balanced entry with a long dot list (leaf topic index). */
  readonly singleLongSection?: boolean;
};

export function conceptIndexFocusedClusterColumnCount(
  widthCapacity: number,
  packWeight: number,
  paneHeightPx: number,
  counts?: FocusedClusterIndexCounts,
  options?: FocusedClusterColumnCountOptions,
): number {
  if (!Number.isFinite(widthCapacity) || widthCapacity < 1) {
    return 1;
  }
  const paneH =
    Number.isFinite(paneHeightPx) && paneHeightPx > 0 ? paneHeightPx : 640;
  const weight = resolvedPackWeight(packWeight, counts);
  const heightNeed =
    weight > 0 ? conceptIndexColumnCountForContentHeight(weight, paneH) : 1;
  let count = Math.min(widthCapacity, Math.max(1, heightNeed));
  if (widthCapacity >= 2) {
    count = Math.max(count, 2);
  }
  const viewport = options?.viewportWidthPx;
  const contentW = options?.contentWidthPx;
  const wideViewport =
    viewport !== undefined &&
    viewport >= CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX;
  const paneFitsThreeTracks =
    contentW === undefined ||
    contentW <= 0 ||
    (viewport !== undefined &&
      conceptIndexRawColumnCountForWidth(contentW) >= 3);
  if (wideViewport && widthCapacity >= 3 && count < 3 && paneFitsThreeTracks) {
    count = Math.min(widthCapacity, 3);
  }
  return count;
}