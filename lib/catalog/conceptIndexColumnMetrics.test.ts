import assert from "node:assert/strict";
import test from "node:test";
import {
  CONCEPT_INDEX_COL_GAP_REM,
  CONCEPT_INDEX_COL_MIN_REM,
  CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX,
  CONCEPT_INDEX_WEIGHT_ROW_PX,
  conceptIndexColumnCountForContentHeight,
  conceptIndexColumnCountForWidth,
  conceptIndexPanePackScrollColumnCount,
} from "./conceptIndexColumnMetrics";

const ROOT = 16;

test("conceptIndexColumnCountForWidth returns 1 when narrow", () => {
  assert.equal(
    conceptIndexColumnCountForWidth(CONCEPT_INDEX_COL_MIN_REM * ROOT - 1, ROOT),
    1,
  );
});

test("conceptIndexColumnCountForWidth returns 2 when two min tracks fit", () => {
  const two =
    2 * CONCEPT_INDEX_COL_MIN_REM * ROOT + CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(conceptIndexColumnCountForWidth(two, ROOT), 2);
  assert.equal(conceptIndexColumnCountForWidth(two - 1, ROOT), 1);
});

test("conceptIndexColumnCountForWidth returns 3 when three min tracks fit", () => {
  const three =
    3 * CONCEPT_INDEX_COL_MIN_REM * ROOT + 2 * CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(conceptIndexColumnCountForWidth(three, ROOT), 3);
  assert.equal(conceptIndexColumnCountForWidth(three - 1, ROOT), 2);
});

test("conceptIndexColumnCountForContentHeight keeps one column when content fits the pane", () => {
  const pane = 640;
  const rows = Math.floor((pane * 0.82) / CONCEPT_INDEX_WEIGHT_ROW_PX);
  assert.equal(conceptIndexColumnCountForContentHeight(rows, pane), 1);
  assert.equal(conceptIndexColumnCountForContentHeight(rows + 1, pane), 2);
});

test("conceptIndexColumnCountForWidth returns up to 4 columns on wide panes", () => {
  const four =
    4 * CONCEPT_INDEX_COL_MIN_REM * ROOT + 3 * CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(
    conceptIndexColumnCountForWidth(
      four,
      ROOT,
      CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX,
    ),
    4,
  );
});

test("conceptIndexColumnCountForWidth caps at 2 columns below 1280px viewport", () => {
  const four =
    4 * CONCEPT_INDEX_COL_MIN_REM * ROOT + 3 * CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(conceptIndexColumnCountForWidth(four, ROOT, 1024), 2);
  assert.equal(
    conceptIndexColumnCountForWidth(four, ROOT, CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX - 1),
    2,
  );
});

test("conceptIndexColumnCountForWidth prefers 2 columns near 1280px when pane fits two tracks", () => {
  const twoTrack =
    2 * CONCEPT_INDEX_COL_MIN_REM * ROOT + CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(
    conceptIndexColumnCountForWidth(twoTrack, ROOT, 1259),
    2,
  );
});

test("conceptIndexPanePackScrollColumnCount keeps one track when column need is 1", () => {
  const pane = 900;
  assert.equal(
    conceptIndexPanePackScrollColumnCount(3, 1, 1259, pane, ROOT),
    1,
  );
});

test("conceptIndexPanePackScrollColumnCount forces 2 in dual viewport when need is 2", () => {
  const pane = 900;
  assert.equal(
    conceptIndexPanePackScrollColumnCount(3, 2, 1259, pane, ROOT),
    2,
  );
});

test("conceptIndexColumnCountForWidth may use more than 2 columns from 1280px viewport", () => {
  const four =
    4 * CONCEPT_INDEX_COL_MIN_REM * ROOT + 3 * CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(
    conceptIndexColumnCountForWidth(four, ROOT, CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX),
    4,
  );
});
