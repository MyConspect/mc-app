"use client";

import type { ConceptIndexBalancedEntry } from "@/components/topic/ConceptIndexBalancedLayout";
import { CONCEPT_INDEX_CLUSTER_SECTION } from "@/components/topic/conceptIndexStyles";
import type { BrowseCard } from "@/lib/catalog";
import { normalizeTrackBrowseSections } from "@/lib/catalog/trackBrowseSubjectSections";
import { ClusterConceptIndexSection } from "./ClusterCardSections";
import { CardGrid, type CardItem } from "./CardGrid";
import type { TrackBrowseIndexBlock } from "./TrackBrowseIndex";

function appendVisibleCards(target: CardItem[], cards: readonly CardItem[]) {
  for (const card of cards) {
    if (card.title.trim().length > 0) {
      target.push(card);
    }
  }
}

export function buildTrackBrowseBalancedEntries({
  blocks,
  looseCards,
}: {
  readonly blocks: readonly TrackBrowseIndexBlock[];
  readonly looseCards: readonly BrowseCard[];
}): readonly ConceptIndexBalancedEntry[] {
  const entries: ConceptIndexBalancedEntry[] = [];
  const trackFlatItems: CardItem[] = [];

  for (const block of blocks) {
    const sections = normalizeTrackBrowseSections(
      block.subjectSlug,
      block.sections,
      {
        clusterLinksOnly: block.clusterLinksOnly,
        subject: block.catalogSubject,
        locale: block.locale,
      },
    );
    const items = sections.flatMap((section) => section.items);
    if (items.length === 0) {
      continue;
    }
    entries.push({
      key: `${block.subjectHref}:topics`,
      weight: Math.max(1, items.length),
      listItemCount: items.length,
      node: (
        <ClusterConceptIndexSection
          section={{
            cluster: {
              id: `${block.subjectSlug}-track-hub`,
              title: block.subjectTitle,
              blurb: "",
            },
            headingHref: block.subjectHref,
            items,
          }}
          omitSubjectTitleClusterHeading={false}
        />
      ),
    });
  }

  appendVisibleCards(trackFlatItems, looseCards);

  if (trackFlatItems.length > 0) {
    const flatEntry: ConceptIndexBalancedEntry = {
      key: "track-flat-topics",
      weight: trackFlatItems.length,
      listItemCount: trackFlatItems.length,
      node: (
        <section className={CONCEPT_INDEX_CLUSTER_SECTION}>
          <CardGrid items={trackFlatItems} variant="concept-index" />
        </section>
      ),
    };
    entries.unshift(flatEntry);
  }

  return entries;
}
