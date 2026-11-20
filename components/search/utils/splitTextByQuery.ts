import {
  searchHighlightRegExp,
  searchQueryTokens,
  textMatchesSearchToken,
} from "./searchQueryTokens";

export type TextQueryPart = {
  readonly text: string;
  readonly match: boolean;
};

export function splitTextByQuery(
  text: string,
  query: string,
): readonly TextQueryPart[] {
  const tokens = searchQueryTokens(query);
  if (tokens.length === 0) {
    return [{ text, match: false }];
  }

  const re = searchHighlightRegExp(tokens);
  if (!re) {
    return [{ text, match: false }];
  }

  const parts = text.split(re);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      match: textMatchesSearchToken(part, tokens),
    }));
}