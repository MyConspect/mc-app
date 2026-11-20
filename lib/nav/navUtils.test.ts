import assert from "node:assert/strict";
import test from "node:test";
import { getTopic } from "@/lib/catalog";
import {
  areRedundantNavTitles,
  isRedundantSubjectTopicNavRow,
  sameTitle,
  topicLeafIndexHeading,
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

test("topicLeafIndexHeading prefers catalog title over markdown H1", () => {
  const intro = getTopic("computer-science", "algorithms-common");
  assert.ok(intro);
  assert.equal(
    topicLeafIndexHeading("en", intro, "Algorithms — Common"),
    "Intro",
  );
  const bigO = getTopic("computer-science", "algorithms-core");
  assert.ok(bigO);
  assert.equal(
    topicLeafIndexHeading("en", bigO, "Algorithms — Big O"),
    "Big O",
  );
});
