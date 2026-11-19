import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexTrackColumnSpans } from "./conceptIndexTrackSpan";

test("conceptIndexTrackColumnSpans widens a lone long section when columns allow", () => {
  const spans = conceptIndexTrackColumnSpans([2, 1, 1], [[8, 5], [18], [4]], 4);
  assert.deepEqual(spans, [1, 2, 1]);
});

test("conceptIndexTrackColumnSpans keeps width 1 when no room for span", () => {
  const spans = conceptIndexTrackColumnSpans(
    [1, 1, 1, 1],
    [[20], [3], [3], [3]],
    4,
  );
  assert.deepEqual(spans, [1, 1, 1, 1]);
});
