import assert from "node:assert/strict";
import { test } from "node:test";
import {
  conceptIdFromFragment,
  resolveHandbookConceptId,
} from "./resolveHandbookConcept";

const concepts = [
  { id: "jsx" },
  { id: "fragments" },
  { id: "what-is-go-vet-and-when-would-you-use-it" },
] as const;

test("conceptIdFromFragment ignores concept-group section ids", () => {
  assert.equal(
    conceptIdFromFragment("#concept-group-fundamentals", concepts),
    "",
  );
});

test("resolveHandbookConceptId prefers pending hash over active id", () => {
  assert.equal(
    resolveHandbookConceptId(concepts, {
      pendingHash: "#fragments",
      activeConceptId: "jsx",
      bootConceptId: "jsx",
    }),
    "fragments",
  );
});

test("resolveHandbookConceptId prefers location over boot stale id", () => {
  assert.equal(
    resolveHandbookConceptId(concepts, {
      locationHash: "#fragments",
      bootConceptId: "jsx",
    }),
    "fragments",
  );
});

test("resolveHandbookConceptId accepts bare dom id", () => {
  assert.equal(
    resolveHandbookConceptId(concepts, {
      domConceptId: "what-is-go-vet-and-when-would-you-use-it",
      activeConceptId: "jsx",
    }),
    "what-is-go-vet-and-when-would-you-use-it",
  );
});