import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexColumnCountForPaneSpace } from "./clusterIndexFitsPane";

test("column count grows with width capacity for same pack", () => {
  const packWeight = 120;
  const paneHeightPx = 900;
  const narrow = conceptIndexColumnCountForPaneSpace(packWeight, paneHeightPx, 2, {
    scrollPane: false,
  });
  const wide = conceptIndexColumnCountForPaneSpace(packWeight, paneHeightPx, 6, {
    scrollPane: false,
  });
  assert.ok(wide >= narrow);
  assert.ok(wide <= 6);
});

test("section entry count only caps when single-pane height spread", () => {
  const columns = conceptIndexColumnCountForPaneSpace(8, 1100, 6, {
    sectionEntryCount: 4,
    scrollPane: false,
  });
  assert.equal(columns, 1);
});

test("track browse matches space model with many sections", () => {
  const withNine = conceptIndexColumnCountForPaneSpace(72, 1100, 6, {
    sectionEntryCount: 9,
    scrollPane: false,
  });
  const without = conceptIndexColumnCountForPaneSpace(72, 1100, 6, {
    scrollPane: false,
  });
  assert.equal(withNine, without);
});