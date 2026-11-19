import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { handbookNavForTrack } from "./handbook";
import { navSubjectClusters } from "./subjectClusters";
import { conceptGroupSectionDomId } from "./conceptGroupSection";

test("CSS Core cluster exposes markdown groups as nested sidebar clusters", () => {
  const groups = handbookNavForTrack("en", "frontend");
  const frontend = groups.find((group) => group.id === "frontend");
  assert.ok(frontend);
  const css = frontend.entries.find(
    (entry) => entry.kind === "subject" && entry.subject.slug === "css",
  );
  assert.equal(css?.kind, "subject");
  if (css?.kind !== "subject") {
    return;
  }
  const core = navSubjectClusters(css.subject).find(
    (cluster) => cluster.id === "core",
  );
  assert.ok(core?.nestedClusters?.length);
  const selectorsId = conceptGroupSectionDomId("Selectors & Cascade");
  assert.ok(core.nestedClusters.some((cluster) => cluster.id === selectorsId));
  assert.equal(core.topics.length, 1);
  assert.equal(core.topics[0]?.hideSidebarConcepts, true);
  assert.ok(core.nestedClusters.every((c) => c.topics.length === 1));
  assert.ok(
    core.nestedClusters.every((c) => (c.topics[0]?.concepts.length ?? 0) > 0),
  );
  assert.equal(core.href, "/en/frontend/css#core");
});
