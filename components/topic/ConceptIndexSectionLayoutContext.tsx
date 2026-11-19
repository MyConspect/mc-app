"use client";

import { createContext, useContext, type ReactNode } from "react";

type Layout = {
  readonly gridSpan: number;
  readonly listColumnCount: number;
};

const ConceptIndexSectionLayoutContext = createContext<Layout | null>(null);

export function ConceptIndexSectionLayoutProvider({
  gridSpan,
  listColumnCount,
  children,
}: {
  readonly gridSpan: number;
  readonly listColumnCount: number;
  readonly children: ReactNode;
}) {
  return (
    <ConceptIndexSectionLayoutContext.Provider
      value={{ gridSpan, listColumnCount }}
    >
      {children}
    </ConceptIndexSectionLayoutContext.Provider>
  );
}

export function useConceptIndexSectionLayout(): Layout | null {
  return useContext(ConceptIndexSectionLayoutContext);
}
