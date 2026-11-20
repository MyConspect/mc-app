"use client";

import { BODY_QUERY_MIN_LENGTH } from "@/lib/nav";
import { SEARCH_CONTENT_MARK_CLASS } from "../searchMarkClass";
import {
  searchHighlightRegExp,
  searchQueryTokens,
} from "./searchQueryTokens";

export function highlightQueryInHtml(html: string, query: string): string {
  const tokens = searchQueryTokens(query).filter(
    (token) => token.length >= BODY_QUERY_MIN_LENGTH,
  );
  if (tokens.length === 0) {
    return html;
  }

  const re = searchHighlightRegExp(tokens);
  if (!re) {
    return html;
  }

  let skipDepth = 0;

  return html.replace(
    /<\/?(pre|code|mark|script|style)\b[^>]*>|[^<]+|<[^>]+>/gi,
    (chunk) => {
      const skipTag = chunk.match(/^<\/?(pre|code|mark|script|style)\b/i);
      if (skipTag) {
        skipDepth += chunk.startsWith("</") ? -1 : 1;
        if (skipDepth < 0) {
          skipDepth = 0;
        }
        return chunk;
      }
      if (skipDepth > 0 || chunk.startsWith("<")) {
        return chunk;
      }
      return chunk.replace(
        re,
        (match) => `<mark class="${SEARCH_CONTENT_MARK_CLASS}">${match}</mark>`,
      );
    },
  );
}