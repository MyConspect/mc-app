import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexSectionGridSpan } from "./conceptIndexSectionGridSpan";

test("conceptIndexSectionGridSpan grows across columns for long lists", () => {
  const pane = 640;
  assert.equal(conceptIndexSectionGridSpan(5, pane, 4), 1);
  assert.equal(conceptIndexSectionGridSpan(7, pane, 4), 2);
  assert.equal(conceptIndexSectionGridSpan(14, pane, 4), 3);
  assert.equal(conceptIndexSectionGridSpan(40, pane, 4), 4);
});
