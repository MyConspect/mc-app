import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptIndexContentBoundsFitPane,
  conceptIndexRenderedFitsPane,
} from "./conceptIndexRenderedFitsPane";

test("conceptIndexRenderedFitsPane allows slack under the pane budget", () => {
  assert.equal(conceptIndexRenderedFitsPane(500, 520), true);
  assert.equal(conceptIndexRenderedFitsPane(540, 520), false);
});

test("conceptIndexContentBoundsFitPane rejects vertical and horizontal spill", () => {
  assert.equal(conceptIndexContentBoundsFitPane(900, 963, 1400, 1500), true);
  assert.equal(conceptIndexContentBoundsFitPane(1000, 963, 1400, 1500), false);
  assert.equal(conceptIndexContentBoundsFitPane(900, 963, 1600, 1500), false);
});
