import assert from "node:assert/strict";
import test from "node:test";
import {
  getSubject,
  getTopic,
  isInterviewTopic,
  isInterviewTasksTopic,
  isNavHubTopic,
  navChildBrowseCards,
} from "@/lib/catalog";
import { subjectClusterSectionsForLocale } from "./localizeSubjectClusters";
import { filterSubjectClusterSectionsForIntro } from "./subjectIntroClusters";

test("html-a11y is a theory topic (no interview accordion)", () => {
  const topic = getTopic("frontend", "html-a11y");
  assert.ok(topic);
  assert.equal(isInterviewTopic(topic), false);
  assert.equal(isInterviewTasksTopic(topic), false);
});

test("html-interview uses interview accordion", () => {
  const topic = getTopic("frontend", "html-interview");
  assert.ok(topic);
  assert.equal(isInterviewTopic(topic), true);
});

test("react-interview is an interview accordion topic, not a nav hub", () => {
  const topic = getTopic("frontend", "react-interview");
  assert.ok(topic);
  assert.equal(isInterviewTopic(topic), true);
  assert.equal(navChildBrowseCards(topic).length, 0);
  assert.equal(isNavHubTopic(topic), false);
});

test("core intro omits platform cluster and keeps accessibility and security", () => {
  const subject = getSubject("frontend", "core");
  assert.ok(subject);
  const sections = subjectClusterSectionsForLocale("en", subject);
  const filtered = filterSubjectClusterSectionsForIntro(
    subject,
    sections,
    true,
  );
  const ids = filtered.map((section) => section.cluster.id);
  assert.ok(!ids.includes("platform"));
  assert.deepEqual(ids, ["accessibility", "security"]);
});
