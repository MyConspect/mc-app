"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

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
  const value = useMemo(
    (): Layout => ({ gridSpan, listColumnCount }),
    [gridSpan, listColumnCount],
  );
  return (
    <ConceptIndexSectionLayoutContext.Provider value={value}>
      {children}
    </ConceptIndexSectionLayoutContext.Provider>
  );
}

export function useConceptIndexSectionLayout(): Layout | null {
  return useContext(ConceptIndexSectionLayoutContext);
}
