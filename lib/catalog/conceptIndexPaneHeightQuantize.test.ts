import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexQuantizedPaneHeightPx } from "./conceptIndexPaneHeightQuantize";

test("quantizes pane height to reduce resize churn", () => {
  assert.equal(conceptIndexQuantizedPaneHeightPx(1137), 1152);
  assert.equal(conceptIndexQuantizedPaneHeightPx(1121), 1120);
});