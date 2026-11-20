"use client";

import { HighlightedText } from "./HighlightedText";
import { useSearchQuery } from "./context/SearchQueryContext";

export function SearchHighlightedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const query = useSearchQuery();
  return <HighlightedText text={text} query={query} className={className} />;
}