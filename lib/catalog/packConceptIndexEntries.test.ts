import assert from "node:assert/strict";
import test from "node:test";
import {
  packConceptIndexEntries,
  type ConceptIndexPackableEntry,
} from "./packConceptIndexEntries";

function entry(
  id: string,
  weight: number,
  listItemCount: number,
): ConceptIndexPackableEntry {
  return {
    key: id,
    weight,
    listItemCount,
  };
}

test("packConceptIndexEntries breaks after long lists and may stack short sections", () => {
  const entries = [
    entry("core", 15, 13),
    entry("modules", 18, 16),
    entry("http", 24, 22),
    entry("additional", 9, 7),
  ];
  const packed = packConceptIndexEntries(entries, 720, 4);
  assert.ok(packed.length >= 2 && packed.length <= 4);
  const keys = packed.flat().map((item) => item.key);
  assert.deepEqual(keys, ["core", "modules", "http", "additional"]);
});

test("packConceptIndexEntries keeps Additional in its own track when width allows three columns", () => {
  const entries = [
    entry("core", 15, 13),
    entry("modules", 18, 16),
    entry("http", 24, 22),
    entry("additional", 9, 7),
  ];
  const packed = packConceptIndexEntries(entries, 720, 3);
  assert.equal(packed.length, 3);
  assert.deepEqual(
    packed.map((column) => column.map((item) => item.key)),
    [["core"], ["modules", "http"], ["additional"]],
  );
});
