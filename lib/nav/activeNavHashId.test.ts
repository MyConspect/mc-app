import assert from "node:assert/strict";
import { test } from "node:test";
import { activeNavHashId } from "./activeNavHashId";

const concepts = [
  { id: "what-is-a-hash-table" },
  { id: "collision-resolution" },
] as const;

test("activeNavHashId preserves concept-group section dom ids", () => {
  assert.equal(
    activeNavHashId("concept-group-basic-hash-table-concepts", concepts),
    "concept-group-basic-hash-table-concepts",
  );
});

test("activeNavHashId resolves concept ids against topic catalog", () => {
  assert.equal(
    activeNavHashId("what-is-a-hash-table", concepts),
    "what-is-a-hash-table",
  );
});