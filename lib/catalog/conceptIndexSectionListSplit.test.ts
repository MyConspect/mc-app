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

test("conceptIndexSectionListColumnCount keeps medium lists single-column", () => {
  assert.equal(conceptIndexSectionListColumnCount(8), 1);
  assert.equal(conceptIndexSectionListLayoutClass(8), "");
  assert.equal(conceptIndexSectionListColumnCount(11), 1);
});

test("conceptIndexSectionListColumnCount adds columns for long lists without pane height", () => {
  assert.equal(conceptIndexSectionListColumnCount(16), 4);
  assert.ok(conceptIndexSectionListLayoutClass(16).includes("list-split"));
});

test("conceptIndexSectionListColumnCount keeps one column when pane fits all rows", () => {
  assert.equal(conceptIndexSectionListColumnCount(9, 923), 1);
  assert.equal(conceptIndexSectionListLayoutClass(9, 923), "");
  assert.equal(conceptIndexSectionListColumnCount(14, 923, 2), 1);
  assert.equal(conceptIndexSectionListLayoutClass(14, 923, 2), "");
  assert.equal(conceptIndexSectionListColumnCount(12, 923, 3), 1);
});

test("conceptIndexSectionListColumnCount splits when pane is shorter than list", () => {
  assert.ok(conceptIndexSectionListColumnCount(30, 220) > 1);
});