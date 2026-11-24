import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexShouldUsePaneScroll } from "./conceptIndexShouldUsePaneScroll";

/** Mirrors ConceptIndexNewspaperColumns usePaneHeightShell gate. */
function shouldUsePaneHeightShell(
  panePack: boolean,
  effectivePaneHeight: number,
): boolean {
  return panePack && effectivePaneHeight > 0;
}

test("shouldUsePaneHeightShell is false without pane pack", () => {
  assert.equal(shouldUsePaneHeightShell(false, 700), false);
});

test("shouldUsePaneHeightShell is true for pane pack with height", () => {
  assert.equal(shouldUsePaneHeightShell(true, 500), true);
});

test("shouldUsePaneScroll when pack weight overflows the pane", () => {
  assert.equal(conceptIndexShouldUsePaneScroll(false, false), true);
  assert.equal(conceptIndexShouldUsePaneScroll(false, null), true);
});

test("shouldUsePaneScroll trusts DOM fit over weight overflow", () => {
  assert.equal(conceptIndexShouldUsePaneScroll(false, true), false);
});

test("shouldUsePaneScroll skips scroll when pack and DOM both fit", () => {
  assert.equal(conceptIndexShouldUsePaneScroll(true, true), false);
  assert.equal(conceptIndexShouldUsePaneScroll(true, false), true);
  assert.equal(conceptIndexShouldUsePaneScroll(true, null), false);
});

test("shouldUsePaneScroll follows engaged overflow latch", () => {
  assert.equal(conceptIndexShouldUsePaneScroll(true, true, true), true);
  assert.equal(conceptIndexShouldUsePaneScroll(true, null, true), true);
  assert.equal(conceptIndexShouldUsePaneScroll(true, false, true), true);
});
