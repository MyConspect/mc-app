import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import {
  auditCatalogTopicLayoutModes,
  auditPreferNewspaperFromOne,
} from "./handbookIndexLayoutPolicy";

const MC_APP = path.join(import.meta.dirname, "..", "..");

test("auditPreferNewspaperFromOne passes on current tree", () => {
  const violations = auditPreferNewspaperFromOne(MC_APP);
  assert.deepEqual(violations, []);
});

test("auditCatalogTopicLayoutModes passes for medium single-section topics", () => {
  const violations = auditCatalogTopicLayoutModes().filter((v) =>
    v.topicKey?.includes("oop") || v.topicKey?.includes("solid"),
  );
  assert.deepEqual(violations, []);
});