"use client";

import { type ReactNode } from "react";
import { CONCEPT_INDEX_SECTIONS_GRID } from "./conceptIndexStyles";

/** Section index grid: auto-fit min tracks across the full index pane width. */
export function ConceptIndexSectionsGrid({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div className={CONCEPT_INDEX_SECTIONS_GRID}>{children}</div>
  );
}
