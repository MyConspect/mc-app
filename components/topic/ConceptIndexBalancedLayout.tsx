"use client";

import { useMemo, type ReactNode } from "react";
import type { ConceptIndexLayoutColumnNeedOptions } from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import { ConceptIndexNewspaperColumns } from "./ConceptIndexNewspaperColumns";
import { ConceptIndexSectionsGrid } from "./ConceptIndexSectionsGrid";

export type ConceptIndexLayoutMode = "stack" | "newspaper" | "sections-grid";

export type ConceptIndexBalancedEntry = {
  readonly key: string;
  readonly weight: number;
  /** Bullet rows in this section (for split layout + packing). */
  readonly listItemCount: number;
  readonly node: ReactNode;
};

export type ConceptIndexEntriesSource =
  | readonly ConceptIndexBalancedEntry[]
  | ((paneHeightPx: number) => readonly ConceptIndexBalancedEntry[]);

/** Index sections: stacked list or newspaper columns. */
export function ConceptIndexBalancedLayout({
  entries,
  layoutMode,
  usePaneColumnFlow = true,
  paneHeightPx = 640,
  columnNeedOptions,
  widthColumnCapacity,
  indexRootClassName,
  paneMeasureRef,
}: {
  readonly entries: ConceptIndexEntriesSource;
  readonly layoutMode?: ConceptIndexLayoutMode;
  /** Multi-column newspaper flow when layoutMode is omitted (off = single stack). */
  readonly usePaneColumnFlow?: boolean;
  /** Measured main-column height for packing (client). */
  readonly paneHeightPx?: number;
  readonly columnNeedOptions?: ConceptIndexLayoutColumnNeedOptions;
  /** Measured index-pane column capacity (parent `.handbook-subject-index-body`). */
  readonly widthColumnCapacity?: number;
  readonly indexRootClassName?: string;
  readonly paneMeasureRef?: (element: HTMLDivElement | null) => void;
  /** @deprecated Wide grid spans are unused; newspaper flow handles layout. */
  readonly allowWideSectionTracks?: boolean;
}) {
  const resolvedEntries = useMemo(
    () => (typeof entries === "function" ? entries(paneHeightPx) : entries),
    [entries, paneHeightPx],
  );

  const mode: ConceptIndexLayoutMode =
    layoutMode ??
    (resolvedEntries.length > 1 && usePaneColumnFlow ? "newspaper" : "stack");

  if (resolvedEntries.length === 0) {
    return null;
  }

  if (mode === "sections-grid" && resolvedEntries.length > 1) {
    return (
      <ConceptIndexSectionsGrid>
        {resolvedEntries.map((entry) => (
          <div key={entry.key} className="min-w-0 w-full max-w-full">
            {entry.node}
          </div>
        ))}
      </ConceptIndexSectionsGrid>
    );
  }

  if (mode === "stack") {
    return (
      <div
        ref={paneMeasureRef}
        className={`concept-list-index w-full space-y-8${indexRootClassName ? ` ${indexRootClassName}` : ""}`}
      >
        {resolvedEntries.map((entry) => (
          <div key={entry.key}>{entry.node}</div>
        ))}
      </div>
    );
  }

  return (
    <ConceptIndexNewspaperColumns
      entries={resolvedEntries}
      fixedViewportColumns={false}
      columnNeedOptions={columnNeedOptions}
      paneHeightPx={paneHeightPx}
      widthColumnCapacity={widthColumnCapacity}
      rootClassName={indexRootClassName}
      paneMeasureRef={paneMeasureRef}
    />
  );
}