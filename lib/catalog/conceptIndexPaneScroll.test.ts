import assert from "node:assert/strict";
import test from "node:test";
import { clusterIndexFitsPane } from "./clusterIndexFitsPane";

/** Mirrors ConceptIndexNewspaperColumns lockScrollPaneHeight gate. */
function shouldLockScrollPaneHeight(
  panePack: boolean,
  lockPaneHeight: boolean,
  scrollColumnCount: number,
  effectivePaneHeight: number,
  packWeight: number,
): boolean {
  if (!panePack || lockPaneHeight || scrollColumnCount <= 1) {
    return false;
  }
  if (effectivePaneHeight <= 0) {
    return false;
  }
  return !clusterIndexFitsPane(
    packWeight,
    effectivePaneHeight,
    scrollColumnCount,
  );
}

test("shouldLockScrollPaneHeight is false when pack fits the pane", () => {
  assert.equal(shouldLockScrollPaneHeight(true, false, 2, 700, 30), false);
});

test("shouldLockScrollPaneHeight is true when pack overflows the pane", () => {
  assert.equal(shouldLockScrollPaneHeight(true, false, 2, 500, 200), true);
});