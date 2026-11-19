"use client";

import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_SECTION_HEADING,
} from "./conceptIndexStyles";

/** Topic index title above concept lists on leaf topic URLs. */
export function TopicPageTitle({ title }: { title: string }) {
  const trimmed = title.trim();
  if (!trimmed) {
    return null;
  }
  return (
    <h1
      className={`${CONCEPT_INDEX_SECTION_HEADING} ${CONCEPT_GROUP_SECTION_INSET} scroll-mt-24`}
    >
      {trimmed}
    </h1>
  );
}
