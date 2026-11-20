"use client";

import { useMemo } from "react";
import { ConceptIndexPaneLayout } from "@/components/topic/ConceptIndexPaneLayout";
import type { BrowseCard } from "@/lib/catalog";
import { buildFlatBrowseBalancedEntries } from "./buildFlatBrowseBalancedEntries";

export function NavHubBrowseIndex({
  items,
  keyPrefix = "nav-hub",
}: {
  readonly items: readonly BrowseCard[];
  readonly keyPrefix?: string;
}) {
  const entries = useMemo(
    () => buildFlatBrowseBalancedEntries(items, keyPrefix),
    [items, keyPrefix],
  );

  if (items.length === 0) {
    return null;
  }

  return <ConceptIndexPaneLayout entries={entries} />;
}
