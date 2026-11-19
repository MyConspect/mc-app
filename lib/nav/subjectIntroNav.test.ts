import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { navGroupsForRootSection } from "./sections";
import { handbookNavSections, subjectIntroNavClusters } from "./handbook";
import { conceptGroupSectionDomId } from "./conceptGroupSection";

test("subjectIntroNavClusters lists Work Principles and Browser platform for Core", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const clusters = subjectIntroNavClusters(core, "en");
  assert.ok(
    clusters.some((cluster) => cluster.title === "Work Principles"),
    "missing Work Principles",
  );
  assert.ok(
    clusters.some((cluster) => cluster.title === "Browser platform"),
    "missing Browser platform",
  );
  const work = clusters.find((cluster) => cluster.title === "Work Principles");
  assert.ok(work);
  assert.equal(work.id, conceptGroupSectionDomId("Work Principles"));
  assert.equal(work.topics[0]?.href, "/en/frontend/core");
  assert.ok(
    work.topics[0]?.concepts.some(
      (concept) => concept.id === "navigation-and-fetching",
    ),
  );
});

test("handbook nav for Core subject includes intro groups and omits platform cluster", () => {
  const groups = navGroupsForRootSection(handbookNavSections("en"), "conspect");
  const frontend = groups.find((group) => group.id === "frontend");
  assert.ok(frontend);
  const core = frontend.entries.find(
    (entry) => entry.kind === "subject" && entry.subject.slug === "core",
  );
  assert.equal(core?.kind, "subject");
  if (core?.kind !== "subject") {
    return;
  }
  const ids = core.subject.clusters.map((cluster) => cluster.id);
  assert.ok(ids.includes(conceptGroupSectionDomId("Work Principles")));
  assert.ok(ids.includes(conceptGroupSectionDomId("Browser platform")));
  assert.equal(ids.includes("platform"), false);
  assert.ok(ids.includes("accessibility"));
  assert.ok(ids.includes("security"));
});
