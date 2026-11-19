import assert from "node:assert/strict";
import test from "node:test";
import {
  areRedundantNavTitles,
  isRedundantSubjectTopicNavRow,
  sameTitle,
} from "./navUtils";

test("areRedundantNavTitles matches exact and singular/plural pairs", () => {
  assert.equal(areRedundantNavTitles("Databases", "Database"), true);
  assert.equal(areRedundantNavTitles("Testing", "Testing"), true);
  assert.equal(sameTitle("Testing", "Testing"), true);
  assert.equal(areRedundantNavTitles("Frontend", "HTML"), false);
  assert.equal(areRedundantNavTitles("Algorithms", "Algorithm"), true);
});

test("isRedundantSubjectTopicNavRow uses redundant nav title rule", () => {
  assert.equal(isRedundantSubjectTopicNavRow("Databases", "Database"), true);
  assert.equal(isRedundantSubjectTopicNavRow("Workflow", "Workflow"), true);
});
