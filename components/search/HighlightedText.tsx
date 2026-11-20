"use client";

import { SEARCH_CONTENT_MARK_CLASS } from "./searchMarkClass";
import { splitTextByQuery } from "./utils/splitTextByQuery";

export function HighlightedText({
  text,
  query,
  className,
  markClassName = SEARCH_CONTENT_MARK_CLASS,
}: {
  text: string;
  query: string;
  className?: string;
  markClassName?: string;
}) {
  const parts = splitTextByQuery(text, query);
  if (parts.length === 1 && !parts[0].match) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={`${part.text}-${index}`} className={markClassName}>
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        ),
      )}
    </span>
  );
}
