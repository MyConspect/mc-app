import test from "node:test";
import assert from "node:assert/strict";
import { CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX } from "./conceptIndexColumnMetrics";
import { conceptIndexFocusedClusterColumnCount } from "./conceptIndexFocusedClusterColumnCount";

test("conceptIndexFocusedClusterColumnCount bumps long single section to 3 columns on wide viewports", () => {
  const paneWidth = 1312;
  const withoutBump = conceptIndexFocusedClusterColumnCount(4, 47, 750, {
    listRowCount: 45,
    groupHeadingCount: 0,
  });
  assert.equal(withoutBump, 2);

  const withBump = conceptIndexFocusedClusterColumnCount(
    4,
    47,
    750,
    { listRowCount: 45, groupHeadingCount: 0 },
    {
      singleLongSection: true,
      viewportWidthPx: CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX,
      contentWidthPx: paneWidth,
    },
  );
  assert.equal(withBump, 3);
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

test("conceptIndexFocusedClusterColumnCount uses width for multi-section pane pack", () => {
  assert.equal(
    conceptIndexFocusedClusterColumnCount(4, 30, 900, undefined, {
      sectionEntryCount: 4,
      viewportWidthPx: 1500,
      contentWidthPx: 1000,
    }),
    4,
  );
});

test("conceptIndexFocusedClusterColumnCount prefers 3 columns on wide viewports when pane fits", () => {
  const withoutWideViewport = conceptIndexFocusedClusterColumnCount(6, 30, 750);
  assert.equal(withoutWideViewport, 2);

  const withWideViewport = conceptIndexFocusedClusterColumnCount(
    6,
    30,
    750,
    undefined,
    { viewportWidthPx: 1500, contentWidthPx: 1000 },
  );
  assert.equal(withWideViewport, 3);
});
