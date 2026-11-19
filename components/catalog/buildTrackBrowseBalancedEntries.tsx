"use client";

import Link from "next/link";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_HEADING_LINK,
  CONCEPT_INDEX_SECTION_HEADING,
} from "@/components/topic/conceptIndexStyles";
import type { ConceptIndexBalancedEntry } from "@/components/topic/ConceptIndexBalancedLayout";
import type { BrowseCard } from "@/lib/catalog";
import { normalizeTrackBrowseSections } from "@/lib/catalog/trackBrowseSubjectSections";
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
        <div className="min-w-0 w-full max-w-full scroll-mt-24">
          <h2
            className={`${CONCEPT_INDEX_SECTION_HEADING} ${CONCEPT_GROUP_SECTION_INSET} scroll-mt-24`}
          >
            <Link
              href={block.subjectHref}
              className={CONCEPT_INDEX_HEADING_LINK}
            >
              {block.subjectTitle}
            </Link>
          </h2>
          <CardGrid items={items} variant="concept-index" />
        </div>
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
        <section className="min-w-0 w-full max-w-full scroll-mt-24">
          <CardGrid items={trackFlatItems} variant="concept-index" />
        </section>
      ),
    };
    entries.unshift(flatEntry);
  }

  return entries;
}
