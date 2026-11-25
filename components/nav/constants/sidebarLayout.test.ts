import assert from "node:assert/strict";
import test from "node:test";
import type { NavCluster, NavTopic } from "@/lib/nav";
import {
  NAV_MULTI_TOPIC_CHILD_LIST_CLASS,
  NAV_NEST_CHILD_RAIL_INSET_CLASS,
  NAV_NEST_STEP_1,
  NAV_NEST_STEP_2,
  NAV_NEST_STEP_3,
  NAV_TRACK_CHILD_LIST_CLASS,
  SECTION_TOPIC_CONCEPT_INDENT,
  SECTION_TOPIC_INDENT,
  clusterChildTopicNestIndent,
  clusterHasMultiTopicChildren,
  clusterRowNestIndent,
} from "./sidebarLayout";

function topicStub(index: number): NavTopic {
  return {
    slug: `topic-${index}`,
    href: `/en/stub/topic-${index}`,
    title: `Topic ${index}`,
    blurb: "",
    concepts: [],
  };
}

function clusterWithTopicCount(count: number): NavCluster {
  return {
    id: "cluster-stub",
    title: "Cluster",
    href: "/en/stub/cluster",
    topics: Array.from({ length: count }, (_, i) => topicStub(i)),
  };
}

test("nest step constants match Tailwind pl-* tiers", () => {
  assert.equal(NAV_NEST_STEP_1, "pl-2");
  assert.equal(NAV_NEST_STEP_2, "pl-4");
  assert.equal(NAV_NEST_STEP_3, "pl-6");
});

test("track child list class includes yellow rail and base inset", () => {
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bborder-l-2\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bborder-yellow-200\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bml-1\.5\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bpl-2\b/);
});

test("multi-topic child list composes rail inset", () => {
  assert.equal(NAV_NEST_CHILD_RAIL_INSET_CLASS, "ml-1.5 pl-2");
  assert.match(NAV_MULTI_TOPIC_CHILD_LIST_CLASS, /\bmt-1\.5\b/);
  assert.ok(
    NAV_MULTI_TOPIC_CHILD_LIST_CLASS.includes(NAV_NEST_CHILD_RAIL_INSET_CLASS),
  );
});

test("section topic indents alias nest steps", () => {
  assert.equal(SECTION_TOPIC_INDENT, NAV_NEST_STEP_2);
  assert.equal(SECTION_TOPIC_CONCEPT_INDENT, NAV_NEST_STEP_3);
});

test("clusterRowNestIndent steps on topic count", () => {
  assert.equal(clusterRowNestIndent(clusterWithTopicCount(1)), NAV_NEST_STEP_1);
  assert.equal(clusterRowNestIndent(clusterWithTopicCount(2)), NAV_NEST_STEP_2);
});

test("clusterChildTopicNestIndent only for multi-topic clusters", () => {
  assert.equal(
    clusterChildTopicNestIndent(clusterWithTopicCount(1)),
    undefined,
  );
  assert.equal(
    clusterChildTopicNestIndent(clusterWithTopicCount(3)),
    NAV_NEST_STEP_2,
  );
});

test("clusterHasMultiTopicChildren mirrors topics.length > 1", () => {
  assert.equal(clusterHasMultiTopicChildren(clusterWithTopicCount(1)), false);
  assert.equal(clusterHasMultiTopicChildren(clusterWithTopicCount(2)), true);
});