"use client";

import { HighlightedText } from "./HighlightedText";
import { SEARCH_SIDEBAR_MARK_CLASS } from "./searchMarkClass";

export function SidebarHighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  return (
    <HighlightedText
      text={text}
      query={query}
      className={className}
      markClassName={SEARCH_SIDEBAR_MARK_CLASS}
    />
  );
}