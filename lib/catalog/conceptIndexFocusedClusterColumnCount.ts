import {
  conceptIndexClusterIndexPackWeight,
  conceptIndexColumnCountForPaneSpace,
} from "./clusterIndexFitsPane";

export type FocusedClusterIndexCounts = {
  readonly listRowCount: number;
  readonly groupHeadingCount: number;
};

function resolvedPackWeight(
  packWeight: number,
  counts: FocusedClusterIndexCounts | undefined,
): number {
  let weight = Number.isFinite(packWeight) && packWeight > 0 ? packWeight : 0;
  if (counts && (counts.listRowCount > 0 || counts.groupHeadingCount > 0)) {
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

/** Columns for pane-pack index flow (width cap × content height; no extra tracks when one column fits). */
export type FocusedClusterColumnCountOptions = {
  readonly viewportWidthPx?: number;
  readonly contentWidthPx?: number;
  /** One balanced entry with a long dot list (leaf topic index). */
  readonly singleLongSection?: boolean;
  /** Pane newspaper entry count (use width when several sections fit one pane height). */
  readonly sectionEntryCount?: number;
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
  return conceptIndexColumnCountForPaneSpace(weight, paneH, widthCapacity, {
    sectionEntryCount: options?.sectionEntryCount,
    scrollPane: false,
  });
}
