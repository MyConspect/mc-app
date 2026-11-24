import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { navGroupsForRootSection } from "./sections";
import { handbookNavSections, subjectIntroNavClusters } from "./handbook";

test("frontend Core has no subject intro pseudo-clusters", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  const clusters = subjectIntroNavClusters(core, "en");
  assert.equal(clusters.length, 0);
});

test("handbook nav for Core subject lists Platform cluster on hub", () => {
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
  assert.ok(ids.includes("platform"));
  assert.ok(ids.includes("accessibility"));
  assert.ok(ids.includes("security"));
  const platform = core.subject.clusters.find(
    (cluster) => cluster.id === "platform",
  );
  assert.ok(platform);
  assert.equal(platform.topics[0]?.title, "Platform");
});