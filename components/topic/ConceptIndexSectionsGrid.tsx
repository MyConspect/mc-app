"use client";

import { type ReactNode, useState } from "react";
import { conceptIndexSectionsGridTemplateColumns } from "@/lib/catalog/conceptIndexColumnMetrics";
import { CONCEPT_INDEX_SECTIONS_GRID } from "./conceptIndexStyles";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";

/** Section index grid with measured multi-column tracks (HTML/track hubs). */
export function ConceptIndexSectionsGrid({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
  const columnCount = useConceptIndexColumnCount(gridEl);

  return (
    <div
      ref={setGridEl}
      className={CONCEPT_INDEX_SECTIONS_GRID}
      style={{
        gridTemplateColumns:
          conceptIndexSectionsGridTemplateColumns(columnCount),
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
