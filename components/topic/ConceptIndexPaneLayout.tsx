"use client";

import { useMemo, useState } from "react";
import type { ClusterSectionIndexStats } from "@/lib/catalog/clusterIndexFitsPane";
import { conceptIndexPanePackOptionsForEntries } from "@/lib/catalog/clusterIndexFitsPane";
import type { ConceptIndexLayoutColumnNeedOptions } from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import {
  ConceptIndexBalancedLayout,
  type ConceptIndexEntriesSource,
  type ConceptIndexBalancedEntry,
  type ConceptIndexLayoutMode,
} from "./ConceptIndexBalancedLayout";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";

/** Measured index pane + newspaper column flow (subject hubs, track browse, leaf topics). */
export function ConceptIndexPaneLayout({
  entries,
  layoutMode = "newspaper",
  columnNeedOptions: columnNeedOptionsProp,
  packStatsOverride,
  className,
}: {
  readonly entries: ConceptIndexEntriesSource;
  readonly layoutMode?: ConceptIndexLayoutMode;
  readonly columnNeedOptions?: ConceptIndexLayoutColumnNeedOptions;
  /** Focused cluster stats override auto pack weights from entries. */
  readonly packStatsOverride?: ClusterSectionIndexStats;
  readonly className?: string;
}) {
  const [paneEl, setPaneEl] = useState<HTMLDivElement | null>(null);
  const paneHeightPx = useConceptIndexPaneHeight(paneEl);
  const widthColumnCapacity = useConceptIndexColumnCount(paneEl);

  const resolvedEntries = useMemo((): readonly ConceptIndexBalancedEntry[] => {
    if (typeof entries === "function") {
      return entries(paneHeightPx);
    }
    return entries;
  }, [entries, paneHeightPx]);

  const columnNeedOptions = useMemo(() => {
    if (layoutMode === "stack") {
      return columnNeedOptionsProp;
    }
    const auto = conceptIndexPanePackOptionsForEntries(
      resolvedEntries,
      packStatsOverride,
    );
    if (!auto) {
      return columnNeedOptionsProp;
    }
    if (!columnNeedOptionsProp) {
      return auto;
    }
    return { ...auto, ...columnNeedOptionsProp };
  }, [
    layoutMode,
    columnNeedOptionsProp,
    resolvedEntries,
    packStatsOverride,
  ]);

  return (
    <ConceptIndexBalancedLayout
      entries={entries}
      layoutMode={layoutMode}
      paneHeightPx={paneHeightPx}
      widthColumnCapacity={widthColumnCapacity}
      columnNeedOptions={columnNeedOptions}
      indexRootClassName={className}
      paneMeasureRef={setPaneEl}
    />
  );
}