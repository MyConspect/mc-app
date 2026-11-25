import assert from "node:assert/strict";
import test from "node:test";
import type { NavCluster, NavTopic } from "@/lib/nav";
import {
  NAV_MULTI_TOPIC_CHILD_LIST_CLASS,
  NAV_NEST_CHILD_RAIL_INSET_CLASS,
  NAV_CONCEPT_DEEPEST_INDENT,
  NAV_NEST_STEP_1,
  NAV_NEST_STEP_2,
  NAV_NEST_STEP_3,
  NAV_NEST_STEP_4,
  navRowNestStepClass,
  NAV_TRACK_CHILD_DRILL_LIST_CLASS,
  NAV_TRACK_CHILD_LIST_CLASS,
  trackChildListClass,
  SECTION_TOPIC_CONCEPT_INDENT,
  SECTION_TOPIC_INDENT,
  NAV_CLUSTER_DEEPER_INDENT,
  NAV_CONCEPT_UNDER_FOLD_INDENT,
  NAV_FOLD_CHILD_INDENT,
  NAV_SUBJECT_CHILD_INDENT,
  clusterChildTopicNestIndent,
  clusterHasMultiTopicChildren,
  clusterRowNestIndent,
  conceptIndentBelowGroupHeader,
  flatConceptListIndent,
  navConceptTreeIndents,
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

test("nest step constants match 8/11/15/17 px ladder", () => {
  assert.equal(NAV_NEST_STEP_1, "pl-2");
  assert.equal(NAV_NEST_STEP_2, "pl-[11px]");
  assert.equal(NAV_NEST_STEP_3, "pl-[15px]");
  assert.equal(NAV_NEST_STEP_4, "pl-[17px]");
  assert.equal(navRowNestStepClass(1), NAV_NEST_STEP_1);
  assert.equal(navRowNestStepClass(4), NAV_NEST_STEP_4);
  assert.equal(NAV_CONCEPT_DEEPEST_INDENT, NAV_NEST_STEP_4);
});

test("track child list class includes yellow rail and base inset", () => {
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bborder-l-2\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bborder-yellow-200\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bml-1\.5\b/);
  assert.match(NAV_TRACK_CHILD_LIST_CLASS, /\bpl-2\b/);
});

test("trackChildListClass switches rail for drill vs path track", () => {
  assert.equal(trackChildListClass(true), NAV_TRACK_CHILD_LIST_CLASS);
  assert.equal(trackChildListClass(false), NAV_TRACK_CHILD_DRILL_LIST_CLASS);
  assert.match(NAV_TRACK_CHILD_DRILL_LIST_CLASS, /\bborder-zinc-200\b/);
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

test("clusterRowNestIndent steps topic URLs away from subject hub to step 2", () => {
  const subjectHref = "/en/conspect/computer-science/data-structures";
  assert.equal(
    clusterRowNestIndent(
      "/en/conspect/computer-science/data-structures-advanced",
      subjectHref,
    ),
    NAV_FOLD_CHILD_INDENT,
  );
});

test("clusterRowNestIndent keeps hash sections on subject hub at step 1", () => {
  const subjectHref = "/en/conspect/computer-science/system-design";
  assert.equal(
    clusterRowNestIndent(
      "/en/conspect/computer-science/system-design#architecture",
      subjectHref,
    ),
    NAV_SUBJECT_CHILD_INDENT,
  );
  assert.equal(
    clusterRowNestIndent(
      "/en/conspect/computer-science/sd-core",
      subjectHref,
    ),
    NAV_FOLD_CHILD_INDENT,
  );
  assert.equal(NAV_SUBJECT_CHILD_INDENT, "");
});

test("flatConceptListIndent uses group tier on track rail step one", () => {
  assert.equal(
    flatConceptListIndent(true, NAV_SUBJECT_CHILD_INDENT, NAV_FOLD_CHILD_INDENT),
    NAV_SUBJECT_CHILD_INDENT,
  );
  assert.equal(
    flatConceptListIndent(false, NAV_SUBJECT_CHILD_INDENT, NAV_FOLD_CHILD_INDENT),
    NAV_FOLD_CHILD_INDENT,
  );
});

test("navConceptTreeIndents steps under subject-child row", () => {
  const underSubject = navConceptTreeIndents(NAV_SUBJECT_CHILD_INDENT);
  assert.equal(underSubject.group, NAV_FOLD_CHILD_INDENT);
  assert.equal(underSubject.concept, NAV_CONCEPT_UNDER_FOLD_INDENT);
  const underTrackRail = navConceptTreeIndents(NAV_SUBJECT_CHILD_INDENT, {
    firstRowUnderTrackRail: true,
  });
  assert.equal(underTrackRail.group, NAV_SUBJECT_CHILD_INDENT);
  assert.equal(underTrackRail.concept, NAV_FOLD_CHILD_INDENT);
  const deeper = navConceptTreeIndents(NAV_NEST_STEP_2);
  assert.equal(deeper.group, NAV_NEST_STEP_3);
  assert.equal(deeper.concept, NAV_NEST_STEP_3);
});

test("conceptIndentBelowGroupHeader steps concepts under ## group headers", () => {
  assert.equal(
    conceptIndentBelowGroupHeader(NAV_FOLD_CHILD_INDENT),
    NAV_CONCEPT_UNDER_FOLD_INDENT,
  );
  assert.equal(
    conceptIndentBelowGroupHeader(NAV_NEST_STEP_3),
    NAV_NEST_STEP_4,
  );
});

test("clusterChildTopicNestIndent only for multi-topic clusters", () => {
  assert.equal(
    clusterChildTopicNestIndent(clusterWithTopicCount(1)),
    undefined,
  );
  assert.equal(
    clusterChildTopicNestIndent(clusterWithTopicCount(3)),
    NAV_FOLD_CHILD_INDENT,
  );
});

test("clusterHasMultiTopicChildren mirrors topics.length > 1", () => {
  assert.equal(clusterHasMultiTopicChildren(clusterWithTopicCount(1)), false);
  assert.equal(clusterHasMultiTopicChildren(clusterWithTopicCount(2)), true);
});