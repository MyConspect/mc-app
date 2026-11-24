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
  conceptIndexPackedMulticolWidthPx,
  CONCEPT_INDEX_COL_MAX_PX,
} from "./conceptIndexColumnMetrics";

const ROOT = 16;

test("conceptIndexPackedMulticolWidthPx caps track width at col max", () => {
  assert.equal(
    conceptIndexPackedMulticolWidthPx(1, ROOT),
    CONCEPT_INDEX_COL_MAX_PX,
  );
  assert.equal(
    conceptIndexPackedMulticolWidthPx(2, ROOT),
    2 * CONCEPT_INDEX_COL_MAX_PX + 20,
  );
});

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

test("conceptIndexColumnCountForWidth ignores viewport when pane fits more tracks", () => {
  const four =
    4 * CONCEPT_INDEX_COL_MIN_REM * ROOT + 3 * CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(conceptIndexColumnCountForWidth(four, ROOT, 1024), 4);
  assert.equal(
    conceptIndexColumnCountForWidth(
      four,
      ROOT,
      CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX - 1,
    ),
    4,
  );
});

test("conceptIndexColumnCountForWidth uses pane width only near 1280px viewport", () => {
  const twoTrack =
    2 * CONCEPT_INDEX_COL_MIN_REM * ROOT + CONCEPT_INDEX_COL_GAP_REM * ROOT;
  assert.equal(conceptIndexColumnCountForWidth(twoTrack, ROOT, 1259), 2);
});

test("conceptIndexPanePackScrollColumnCount keeps one track when column need is 1", () => {
  const pane = 900;
  assert.equal(
    conceptIndexPanePackScrollColumnCount(3, 1, 1259, pane, ROOT),
    1,
  );
});

test("conceptIndexPanePackScrollColumnCount caps by width capacity", () => {
  assert.equal(conceptIndexPanePackScrollColumnCount(3, 2, 1259, 900, ROOT), 2);
  assert.equal(
    conceptIndexPanePackScrollColumnCount(4, 3, 1500, 1200, ROOT),
    3,
  );
});

test("conceptIndexColumnCountForWidth may use more than 2 columns from 1280px viewport", () => {
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
