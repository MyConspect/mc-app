"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
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
  const value = useMemo(
    (): HandbookNavCatalog => ({ groups, sections }),
    [groups, sections],
  );
  return (
    <HandbookNavGroupsContext.Provider value={value}>
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
