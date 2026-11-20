import assert from "node:assert/strict";
import test from "node:test";
import {
  searchHighlightRegExp,
  searchQueryTokens,
} from "./searchQueryTokens";

test("searchQueryTokens splits on whitespace", () => {
  assert.deepEqual(searchQueryTokens("  programming  para  "), [
    "programming",
    "para",
  ]);
});

test("searchHighlightRegExp prefers longer tokens first", () => {
  const re = searchHighlightRegExp(["prog", "programming"]);
  assert.match("Programming".match(re)?.[0] ?? "", /^Programming$/i);
});