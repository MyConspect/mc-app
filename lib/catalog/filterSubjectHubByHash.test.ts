import assert from "node:assert/strict";
import test from "node:test";
import {
  SUBJECTS,
  getSubject,
  getTopic,
  subjectClusterCards,
  subjectIntroTopicSlug,
} from "@/lib/catalog";
import { loadTopicOutline } from "@/lib/parse";
import {
  localizeSubjectClusterSections,
  subjectClusterSectionsForLocale,
} from "./localizeSubjectClusters";
import { conceptGroupSectionDomId } from "@/lib/nav/conceptGroupSection";
import { titleTwinOutlineConceptsForSubject } from "./titleTwinHubConcepts";
import {
  filterIntroConceptsForHashFocus,
  filterSubjectHubClusterLayout,
  introConceptsForSubjectHubIndex,
  introGroupTitleForSectionId,
  resolveSubjectHubHashFocus,
} from "./filterSubjectHubByHash";

test("resolveSubjectHubHashFocus maps Work Principles hash to concept-group", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const introSlug = subjectIntroTopicSlug(core);
  assert.ok(introSlug);
  const topic = getTopic(core.track, introSlug);
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const sections = localizeSubjectClusterSections(
    "en",
    subjectClusterCards(core),
  );
  const layout = { sections };
  const workId = conceptGroupSectionDomId("Work Principles");
  const focus = resolveSubjectHubHashFocus({
    hashId: workId,
    concepts,
    clusterLayout: layout,
  });
  assert.equal(focus.kind, "concept-group");
  if (focus.kind === "concept-group") {
    assert.equal(focus.sectionId, workId);
  }
});

test("filterSubjectHubByHash keeps one intro group or one cluster section", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const introSlug = subjectIntroTopicSlug(core);
  assert.ok(introSlug);
  const topic = getTopic(core.track, introSlug);
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const sections = localizeSubjectClusterSections(
    "en",
    subjectClusterCards(core),
  );
  const layout = { sections };

  const workId = conceptGroupSectionDomId("Work Principles");
  const workFocus = resolveSubjectHubHashFocus({
    hashId: workId,
    concepts,
    clusterLayout: layout,
  });
  const workConcepts = filterIntroConceptsForHashFocus(concepts, workFocus);
  assert.ok(workConcepts.length >= 3);
  assert.ok(
    workConcepts.every(
      (c) => conceptGroupSectionDomId(c.group ?? "") === workId,
    ),
  );
  const workLayout = filterSubjectHubClusterLayout(layout, workFocus);
  assert.deepEqual(workLayout.sections, []);

  const a11yFocus = resolveSubjectHubHashFocus({
    hashId: "accessibility",
    concepts,
    clusterLayout: layout,
  });
  assert.equal(a11yFocus.kind, "cluster");
  const a11yLayout = filterSubjectHubClusterLayout(layout, a11yFocus);
  assert.equal(a11yLayout.sections?.length, 1);
  assert.equal(a11yLayout.sections?.[0]?.cluster.id, "accessibility");
  const a11yConcepts = filterIntroConceptsForHashFocus(concepts, a11yFocus);
  assert.equal(a11yConcepts.length, 0);
});

test("introGroupTitleForSectionId resolves Work Principles label", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const introSlug = subjectIntroTopicSlug(core);
  assert.ok(introSlug);
  const topic = getTopic(core.track, introSlug);
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const workId = conceptGroupSectionDomId("Work Principles");
  assert.equal(
    introGroupTitleForSectionId(workId, concepts),
    "Work Principles",
  );
});

test("full core hub index uses intro groups only, not title-twin interview groups", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const introSlug = subjectIntroTopicSlug(core);
  assert.ok(introSlug);
  const topic = getTopic(core.track, introSlug);
  assert.ok(topic);
  const introConcepts = loadTopicOutline(topic, "en");
  const focusConcepts = [
    ...introConcepts,
    ...titleTwinOutlineConceptsForSubject(core, "en"),
  ];
  const hubFocus = resolveSubjectHubHashFocus({
    hashId: "",
    concepts: focusConcepts,
    clusterLayout: { sections: [] },
  });
  assert.equal(hubFocus.kind, "none");
  const indexConcepts = introConceptsForSubjectHubIndex(
    introConcepts,
    focusConcepts,
    hubFocus,
  );
  const indexGroups = new Set(
    indexConcepts.map((c) => c.group?.trim()).filter(Boolean),
  );
  assert.ok(indexGroups.has("Work Principles"));
  assert.ok(!indexGroups.has("Web Security Fundamentals"));
  assert.ok(indexConcepts.length < focusConcepts.length);
});

test("cluster focus on HTML Document omits Reference appendix rows", () => {
  const html = SUBJECTS.find((subject) => subject.slug === "html");
  assert.ok(html);
  const sections = localizeSubjectClusterSections(
    "en",
    subjectClusterCards(html),
  );
  const layout = { sections };
  const focus = resolveSubjectHubHashFocus({
    hashId: "document",
    concepts: [],
    clusterLayout: layout,
  });
  assert.equal(focus.kind, "cluster");
  const filtered = filterSubjectHubClusterLayout(layout, focus);
  assert.ok((filtered.sections?.length ?? 0) >= 1);
  assert.ok(
    filtered.sections?.every((section) =>
      section.cluster.id.startsWith("document"),
    ),
  );
  assert.equal(filtered.groupedSections?.length ?? 0, 0);
  assert.equal(filtered.sections?.[0]?.cluster.id, "document");
  const topicTitles =
    filtered.sections?.[0]?.items.map((item) => item.title) ?? [];
  assert.ok(topicTitles.includes("Structure"));
  assert.ok(topicTitles.includes("Semantics"));
  assert.equal(
    filtered.sections?.[0]?.items.some(
      (item) => item.title === "Basic HTML document structure",
    ),
    false,
  );
});

test("principles cluster hash keeps one grouped Principles section", () => {
  const systemDesign = getSubject("computer-science", "system-design");
  assert.ok(systemDesign);
  const sections = subjectClusterSectionsForLocale("en", systemDesign);
  const layout = { sections };
  const focus = resolveSubjectHubHashFocus({
    hashId: "principles",
    concepts: [],
    clusterLayout: layout,
  });
  assert.equal(focus.kind, "cluster");
  if (focus.kind !== "cluster") {
    return;
  }
  assert.equal(focus.clusterId, "principles");
  const filtered = filterSubjectHubClusterLayout(layout, focus);
  assert.equal(filtered.sections?.length, 1);
  assert.equal(filtered.sections?.[0]?.cluster.title, "Principles");
  const topicTitles =
    filtered.sections?.[0]?.items.map((item) => item.title) ?? [];
  assert.ok(topicTitles.includes("OOP & SOLID"));
  assert.ok(topicTitles.includes("GRASP"));
  assert.equal(
    filtered.sections?.[0]?.items.some(
      (item) => item.title === "Encapsulation",
    ),
    false,
  );
});

test("catalog cluster hash wins over same-named concept on subject hub", () => {
  const systemDesign = getSubject("computer-science", "system-design");
  assert.ok(systemDesign);
  const sections = subjectClusterSectionsForLocale("en", systemDesign);
  const topic = getTopic("computer-science", "special-architecture");
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const focus = resolveSubjectHubHashFocus({
    hashId: "architecture",
    concepts,
    clusterLayout: { sections },
  });
  assert.deepEqual(focus, { kind: "cluster", clusterId: "architecture" });
});

test("concept hash resolves to reading mode, not index filter", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const introSlug = subjectIntroTopicSlug(core);
  assert.ok(introSlug);
  const topic = getTopic(core.track, introSlug);
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const focus = resolveSubjectHubHashFocus({
    hashId: "navigation-and-fetching",
    concepts,
    clusterLayout: { sections: [] },
  });
  assert.equal(focus.kind, "concept");
});
