import assert from "node:assert/strict";
import test from "node:test";
import { nextConceptHash, resolveConceptId } from "./conceptHash";

test("resolveConceptId maps Node.js hashes that omit the extra hyphen", () => {
  const concepts = [
    { id: "how-does-node-js-handle-child-threads" },
    { id: "what-is-the-event-loop-in-node-js" },
    { id: "explain-process-nexttick" },
  ];
  assert.equal(
    resolveConceptId("how-does-nodejs-handle-child-threads", concepts),
    "how-does-node-js-handle-child-threads",
  );
  assert.equal(
    resolveConceptId("explain-processnexttick", concepts),
    "explain-process-nexttick",
  );
  assert.equal(
    resolveConceptId("how-does-node-js-handle-child-threads", concepts),
    "how-does-node-js-handle-child-threads",
  );
  assert.equal(resolveConceptId("missing-question", concepts), "");
});


const concepts = [
  { id: "closures", title: "Closures" },
  { id: "promises", title: "Promises" },
];

test("nextConceptHash keeps an arrival hash until the query is edited", () => {
  assert.equal(
    nextConceptHash({
      concepts,
      query: "prom",
      mode: "titles",
      currentHash: "closures",
      arrivalHash: "closures",
      queryEdited: false,
    }),
    null,
  );
  assert.equal(
    nextConceptHash({
      concepts,
      query: "prom",
      mode: "titles",
      currentHash: "closures",
      arrivalHash: "closures",
      queryEdited: true,
    }),
    "promises",
  );
});

test("nextConceptHash jumps when the page was opened without a hash", () => {
  assert.equal(
    nextConceptHash({
      concepts,
      query: "prom",
      mode: "titles",
      currentHash: "",
      arrivalHash: "",
      queryEdited: false,
    }),
    "promises",
  );
});
