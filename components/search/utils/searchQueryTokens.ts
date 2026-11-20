export function searchQueryTokens(query: string): readonly string[] {
  return query.trim().split(/\s+/).filter((token) => token.length > 0);
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Alternation regex with longest tokens first so shorter tokens do not steal matches. */
export function searchHighlightRegExp(
  tokens: readonly string[],
): RegExp | null {
  if (tokens.length === 0) {
    return null;
  }

  const pattern = [...tokens]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  return new RegExp(`(${pattern})`, "gi");
}

export function textMatchesSearchToken(
  segment: string,
  tokens: readonly string[],
): boolean {
  const lower = segment.toLowerCase();
  return tokens.some((token) => lower === token.toLowerCase());
}