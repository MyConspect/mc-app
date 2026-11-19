"use client";

import { useMemo } from "react";
import { ConceptIndexPaneLayout } from "@/components/topic/ConceptIndexPaneLayout";
import type { BrowseCard, Subject } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { buildTrackBrowseBalancedEntries } from "./buildTrackBrowseBalancedEntries";
import type { SubjectClusterSection } from "@/lib/catalog/clusterConceptIndex";

type LocalizedClusterSection = SubjectClusterSection;

export type TrackBrowseIndexBlock = {
  readonly subjectSlug: string;
  readonly subjectTitle: string;
  readonly subjectHref: string;
  readonly sections: readonly LocalizedClusterSection[];
  readonly clusterLinksOnly?: boolean;
  readonly catalogSubject?: Subject;
  readonly locale?: Locale;
};

export function TrackBrowseIndex({
  blocks,
  looseCards,
}: {
  readonly blocks: readonly TrackBrowseIndexBlock[];
  readonly looseCards: readonly BrowseCard[];
}) {
  const entries = useMemo(
    () => buildTrackBrowseBalancedEntries({ blocks, looseCards }),
    [blocks, looseCards],
  );

  return <ConceptIndexPaneLayout entries={entries} />;
}
