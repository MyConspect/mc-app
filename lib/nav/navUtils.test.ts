import assert from "node:assert/strict";
import test from "node:test";
import { getTopic } from "@/lib/catalog";
import {
  areRedundantNavTitles,
  isRedundantSubjectTopicNavRow,
  isRedundantTopicConceptTitle,
  sameTitle,
  shouldOpenInterviewTopicFold,
  shouldShowInterviewTopicSidebarConcepts,
  shouldShowTopicConceptFold,
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

test("interviews section keeps question bullets when hideSidebarConcepts", () => {
  const vue = getTopic("frontend", "vue-interview");
  assert.ok(vue);
  assert.equal(
    shouldShowInterviewTopicSidebarConcepts("interviews", vue, 3),
    true,
  );
  assert.equal(
    shouldShowInterviewTopicSidebarConcepts("conspect", vue, 3),
    false,
  );
  assert.equal(
    shouldOpenInterviewTopicFold("interviews", vue, true, false),
    true,
  );
  assert.equal(
    shouldOpenInterviewTopicFold("interviews", vue, false, false),
    false,
  );
});

test("sidebar fold requires visible children, not outline title twins alone", () => {
  const concepts = [{ title: "Kafka" }];
  assert.equal(isRedundantTopicConceptTitle("Kafka", "Kafka"), true);
  assert.equal(shouldShowTopicConceptFold("Kafka", concepts, 0), false);
  assert.equal(shouldShowTopicConceptFold("Kafka", concepts, 1), true);
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
