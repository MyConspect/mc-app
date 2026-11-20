import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptGroupSectionDomId,
  findConceptGroupBySectionId,
  isConceptGroupSectionId,
} from "./conceptGroupSection";

test("conceptGroupSectionDomId slugifies group labels", () => {
  assert.equal(
    conceptGroupSectionDomId("Web Security Fundamentals"),
    "concept-group-web-security-fundamentals",
  );
});

test("findConceptGroupBySectionId resolves interview section hashes", () => {
  const groups = [
    { key: "a", label: "HTML Basics", concepts: [] },
    { key: "b", label: null, concepts: [] },
  ];
  const id = conceptGroupSectionDomId("HTML Basics");
  assert.ok(isConceptGroupSectionId(id));
  assert.equal(findConceptGroupBySectionId(groups, id)?.label, "HTML Basics");
  assert.equal(findConceptGroupBySectionId(groups, "closures"), null);
});
