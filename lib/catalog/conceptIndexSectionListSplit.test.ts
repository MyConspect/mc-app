import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptIndexSectionListColumnCount,
  conceptIndexSectionListLayoutClass,
} from "./conceptIndexSectionListSplit";

test("conceptIndexSectionListColumnCount keeps short lists single-column", () => {
  assert.equal(conceptIndexSectionListColumnCount(5), 1);
  assert.equal(conceptIndexSectionListColumnCount(7), 1);
  assert.equal(conceptIndexSectionListLayoutClass(7), "");
});

test("conceptIndexSectionListColumnCount adds columns when rows fill them", () => {
  assert.equal(conceptIndexSectionListColumnCount(8), 2);
  assert.ok(conceptIndexSectionListLayoutClass(8).includes("list-split"));
  assert.equal(conceptIndexSectionListColumnCount(16), 4);
});
