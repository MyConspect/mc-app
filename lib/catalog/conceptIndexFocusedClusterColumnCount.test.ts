import test from "node:test";
import assert from "node:assert/strict";
import { conceptIndexFocusedClusterColumnCount } from "./conceptIndexFocusedClusterColumnCount";

test("conceptIndexFocusedClusterColumnCount uses extra columns only when pack overflows pane height", () => {
  assert.equal(
    conceptIndexFocusedClusterColumnCount(4, 47, 750, {
      listRowCount: 45,
      groupHeadingCount: 0,
    }),
    2,
  );
});

test("conceptIndexFocusedClusterColumnCount keeps one column for a single short section", () => {
  assert.equal(
    conceptIndexFocusedClusterColumnCount(
      4,
      19,
      900,
      { listRowCount: 17, groupHeadingCount: 0 },
      {
        viewportWidthPx: 1500,
        contentWidthPx: 1000,
        sectionEntryCount: 1,
      },
    ),
    1,
  );
});

test("conceptIndexFocusedClusterColumnCount keeps one column when multi-section hub fits one track", () => {
  assert.equal(
    conceptIndexFocusedClusterColumnCount(4, 30, 900, undefined, {
      sectionEntryCount: 4,
      viewportWidthPx: 1500,
      contentWidthPx: 1000,
    }),
    1,
  );
});

test("conceptIndexFocusedClusterColumnCount is independent of viewport width when pane size is fixed", () => {
  const narrow = conceptIndexFocusedClusterColumnCount(6, 30, 750);
  const wide = conceptIndexFocusedClusterColumnCount(6, 30, 750, undefined, {
    viewportWidthPx: 1500,
    contentWidthPx: 1000,
  });
  assert.equal(narrow, 2);
  assert.equal(wide, 2);
});
