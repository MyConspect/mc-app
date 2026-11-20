import test from "node:test";
import assert from "node:assert/strict";
import { CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX } from "./conceptIndexColumnMetrics";
import { conceptIndexFocusedClusterColumnCount } from "./conceptIndexFocusedClusterColumnCount";

test("conceptIndexFocusedClusterColumnCount bumps long single section to 3 columns on wide viewports", () => {
  const paneWidth = 1312;
  const withoutBump = conceptIndexFocusedClusterColumnCount(
    4,
    47,
    750,
    { listRowCount: 45, groupHeadingCount: 0 },
  );
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

test("conceptIndexFocusedClusterColumnCount prefers 3 columns on wide viewports when pane fits", () => {
  const withoutWideViewport = conceptIndexFocusedClusterColumnCount(
    6,
    30,
    750,
  );
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