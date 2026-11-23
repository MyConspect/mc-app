"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { NavGroup, NavRootSection } from "@/lib/nav";

type HandbookNavCatalog = {
  readonly groups: readonly NavGroup[];
  readonly sections: readonly NavRootSection[] | null;
};

const HandbookNavGroupsContext = createContext<HandbookNavCatalog | null>(null);

export function HandbookNavGroupsProvider({
  groups,
  sections = null,
  children,
}: {
  groups: readonly NavGroup[];
  sections?: readonly NavRootSection[] | null;
  children: ReactNode;
}) {
  return (
    <HandbookNavGroupsContext.Provider value={{ groups, sections }}>
      {children}
    </HandbookNavGroupsContext.Provider>
  );
}

export function useHandbookNavGroups(): readonly NavGroup[] | null {
  return useContext(HandbookNavGroupsContext)?.groups ?? null;
}

export function useHandbookNavSections(): readonly NavRootSection[] | null {
  return useContext(HandbookNavGroupsContext)?.sections ?? null;
}
