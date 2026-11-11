import assert from "node:assert/strict";
import test from "node:test";
import {
  isRedundantTopicConceptTitle,
  shouldShowTopicConceptFold,
  shouldShowTopicIndexTitle,
  withoutRedundantTopicTitles,
} from "./navUtils";

test("isRedundantTopicConceptTitle matches exact titles only", () => {
  assert.equal(isRedundantTopicConceptTitle("Event Loop", "Event Loop"), true);
  assert.equal(
    isRedundantTopicConceptTitle("Event Loop", "Event loop overview"),
    false,
  );
  assert.equal(
    isRedundantTopicConceptTitle("SEO", "SEO fundamentals for developers"),
    false,
  );
  assert.equal(isRedundantTopicConceptTitle("Variables", "Variables"), true);
});

test("withoutRedundantTopicTitles drops title twins and keeps distinct siblings", () => {
  const nested = withoutRedundantTopicTitles(
    "Enums",
    [
      { id: "enums", title: "Enums" },
      { id: "enums-fresher", title: "Enums (fresher)" },
    ],
    (concept) => concept.title,
  );
  assert.deepEqual(
    nested.map((concept) => concept.title),
    ["Enums (fresher)"],
  );
});

test("shouldShowTopicIndexTitle hides the topic H1 for a lone title twin", () => {
  assert.equal(
    shouldShowTopicIndexTitle(
      "Declaration Merging",
      [{ title: "Declaration Merging" }],
      false,
    ),
    false,
  );
  assert.equal(
    shouldShowTopicIndexTitle("Enums", [{ title: "Numeric enums" }], false),
    true,
  );
  assert.equal(
    shouldShowTopicIndexTitle(
      "Language",
      [{ title: "SOLID in Classes" }, { title: "SOLID in Functions" }],
      false,
    ),
    true,
  );
  assert.equal(
    shouldShowTopicIndexTitle(
      "JS — Interview",
      [{ title: "What is a closure?" }],
      true,
    ),
    false,
  );
});

test("shouldShowTopicConceptFold keeps a leftover sibling under the topic", () => {
  const concepts = [{ title: "Enums" }, { title: "Enums (fresher)" }];
  assert.equal(shouldShowTopicConceptFold("Enums", concepts, 1), true);
  assert.equal(shouldShowTopicConceptFold("Enums", concepts, 0), false);
  assert.equal(
    shouldShowTopicConceptFold("Event Loop", [{ title: "Call stack" }], 1),
    false,
  );
  assert.equal(
    shouldShowTopicConceptFold(
      "Language",
      [{ title: "SOLID in Classes" }, { title: "SOLID in Functions" }],
      2,
    ),
    true,
  );
});
