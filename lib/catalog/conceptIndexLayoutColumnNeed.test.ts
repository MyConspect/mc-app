import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexLayoutColumnNeed } from "./conceptIndexLayoutColumnNeed";

test("conceptIndexLayoutColumnNeed requests four tracks for Node.js hub sections", () => {
  assert.equal(conceptIndexLayoutColumnNeed(4, 3, 4), 4);
});

test("conceptIndexLayoutColumnNeed uses width when content fits one pane height", () => {
  assert.equal(conceptIndexLayoutColumnNeed(4, 1, 4), 4);
  assert.equal(conceptIndexLayoutColumnNeed(4, 1, 3), 3);
  assert.equal(conceptIndexLayoutColumnNeed(2, 1, 2), 2);
  assert.equal(conceptIndexLayoutColumnNeed(4, 1, 1), 1);
});

test("conceptIndexLayoutColumnNeed spreads sections across tracks when height needs columns", () => {
  assert.equal(conceptIndexLayoutColumnNeed(4, 3, 4), 4);
  assert.equal(conceptIndexLayoutColumnNeed(4, 2, 4), 4);
  assert.equal(conceptIndexLayoutColumnNeed(3, 2, 4), 2);
});

test("conceptIndexLayoutColumnNeed ignores large entry counts", () => {
  assert.equal(conceptIndexLayoutColumnNeed(4, 2, 12), 2);
});

test("conceptIndexLayoutColumnNeed packs by pane height when oneTrackPerEntry is false", () => {
  assert.equal(
    conceptIndexLayoutColumnNeed(4, 2, 4, { oneTrackPerEntry: false }),
    2,
  );
  assert.equal(
    conceptIndexLayoutColumnNeed(4, 1, 4, { oneTrackPerEntry: false }),
    1,
  );
});
