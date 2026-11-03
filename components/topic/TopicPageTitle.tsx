"use client";

import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { PageTitleHeader } from "./PageTitleHeader";

/** Topic index title; hidden while a concept detail is open. */
export function TopicPageTitle({ title }: { title: string }) {
  const { activeConceptId } = useHandbookLocation();
  if (activeConceptId) {
    return null;
  }
  return <PageTitleHeader title={title} />;
}
