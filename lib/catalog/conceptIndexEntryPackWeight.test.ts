import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexEntryPackWeight } from "./conceptIndexEntryPackWeight";

test("conceptIndexEntryPackWeight returns base weight", () => {
  assert.equal(conceptIndexEntryPackWeight(10, 8, 3), 10);
  assert.equal(conceptIndexEntryPackWeight(9, 6, 2), 9);
});
