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

test("resolveSubjectHubHashFocus maps frontend platform cluster hash", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  assert.equal(subjectIntroTopicSlug(core), undefined);
  const sections = localizeSubjectClusterSections(
    "en",
    subjectClusterCards(core),
  );
  const layout = { sections };
  const focus = resolveSubjectHubHashFocus({
    hashId: "platform",
    concepts: [],
    clusterLayout: layout,
  });
  assert.equal(focus.kind, "cluster");
  if (focus.kind === "cluster") {
    assert.equal(focus.clusterId, "platform");
  }
});

test("filterSubjectHubByHash keeps one cluster section on frontend Core hub", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  const topic = getTopic(core.track, "core-browser-platform");
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const sections = localizeSubjectClusterSections(
    "en",
    subjectClusterCards(core),
  );
  const layout = { sections };

  const platformFocus = resolveSubjectHubHashFocus({
    hashId: "platform",
    concepts,
    clusterLayout: layout,
  });
  assert.equal(platformFocus.kind, "cluster");
  const platformLayout = filterSubjectHubClusterLayout(layout, platformFocus);
  assert.equal(platformLayout.sections?.length, 1);
  assert.equal(platformLayout.sections?.[0]?.cluster.id, "platform");

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

test("introGroupTitleForSectionId returns undefined without intro groups", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  const topic = getTopic(core.track, "core-browser-platform");
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const workId = conceptGroupSectionDomId("Work Principles");
  assert.equal(introGroupTitleForSectionId(workId, concepts), undefined);
});

test("frontend Core hub index uses cluster sections, not intro pseudo-clusters", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  assert.equal(subjectIntroTopicSlug(core), undefined);
  const sections = subjectClusterSectionsForLocale("en", core);
  assert.ok(sections.some((section) => section.cluster.id === "platform"));
  const topic = getTopic(core.track, "core-browser-platform");
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
  assert.equal(indexConcepts.length, introConcepts.length);
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
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  const topic = getTopic(core.track, "core-browser-platform");
  assert.ok(topic);
  const concepts = loadTopicOutline(topic, "en");
  const focus = resolveSubjectHubHashFocus({
    hashId: "navigation-and-fetching",
    concepts,
    clusterLayout: { sections: [] },
  });
  assert.equal(focus.kind, "concept");
});
