import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexFocusedClusterColumnCount } from "./conceptIndexFocusedClusterColumnCount";

test("focused cluster uses at least two columns when pane is wide", () => {
  assert.equal(conceptIndexFocusedClusterColumnCount(3, 12, 640), 2);
});

test("focused cluster grows columns from list weight", () => {
  assert.equal(conceptIndexFocusedClusterColumnCount(4, 200, 400), 4);
});

test("focused cluster counts rows when pack weight is missing", () => {
  assert.equal(
    conceptIndexFocusedClusterColumnCount(4, 0, 640, {
      listRowCount: 72,
      groupHeadingCount: 5,
    }),
    4,
  );
});

test("focused cluster stays one column when pane is narrow", () => {
  assert.equal(conceptIndexFocusedClusterColumnCount(1, 80, 640), 1);
});