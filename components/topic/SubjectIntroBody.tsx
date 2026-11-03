"use client";

import type { ReactNode } from "react";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { ConceptList } from "./ConceptList";
import { TopicNavConceptsProvider } from "./context/TopicNavConceptsContext";
import type { Concept } from "@/lib/parse";

export function SubjectIntroBody({
  fallbackBanner,
  concepts,
  emptyMessage,
  groupInterviewSections,
  clusterHub,
}: {
  fallbackBanner: ReactNode;
  concepts: readonly Concept[];
  emptyMessage: string;
  groupInterviewSections: boolean;
  clusterHub: ReactNode;
}) {
  const { location } = useHandbookLocation();
  const hashId = hashIdFrom(location.hash);
  const conceptOpen = concepts.some((concept) => concept.id === hashId);

  return (
    <>
      <div
        className={
          conceptOpen
            ? "handbook-intro-concept-pane flex min-h-0 max-w-3xl flex-1 flex-col"
            : "max-w-3xl"
        }
      >
        {fallbackBanner}
        <TopicNavConceptsProvider concepts={concepts}>
          <ConceptList
            concepts={concepts}
            emptyMessage={emptyMessage}
            groupInterviewSections={groupInterviewSections}
          />
        </TopicNavConceptsProvider>
      </div>
      {conceptOpen ? null : <div className="mt-10">{clusterHub}</div>}
    </>
  );
}
