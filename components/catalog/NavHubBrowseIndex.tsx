"use client";

import { useMemo } from "react";
import { ConceptIndexBalancedLayout } from "@/components/topic/ConceptIndexBalancedLayout";
import type { BrowseCard } from "@/lib/catalog";
import { CardGrid } from "./CardGrid";

export function NavHubBrowseIndex({
  items,
}: {
  readonly items: readonly BrowseCard[];
}) {
  const entries = useMemo(
    () => [
      {
        key: "nav-hub",
        weight: items.length + 2,
        listItemCount: items.length,
        node: (
          <section className="min-w-0 w-full max-w-full scroll-mt-24">
            <CardGrid items={items} variant="concept-index" />
          </section>
        ),
      },
    ],
    [items],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <ConceptIndexBalancedLayout entries={entries} usePaneColumnFlow={false} />
  );
}
