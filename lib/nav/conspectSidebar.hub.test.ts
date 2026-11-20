import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { handbookNavSections } from "./handbook";
import {
  conspectSubjectHubSectionWithConcepts,
  navSidebarSchema,
} from "./conspectSidebar";

test("conspect schema follows Advanced gold — no hub concept folds in sidebar", () => {
  const schema = navSidebarSchema("conspect");
  assert.equal(schema.mode === "two-level" && schema.hubSectionConcepts, false);
});

test("intro groups on subject hubs still classify for hash navigation", () => {
  const conspect = handbookNavSections("en").find(
    (section) => section.id === "conspect",
  );
  assert.ok(conspect);
  const offenders: string[] = [];

  for (const subject of SUBJECTS) {
    const group = conspect.groups.find((item) => item.id === subject.track);
    const entry = group?.entries.find(
      (item) => item.kind === "subject" && item.subject.slug === subject.slug,
    );
    if (entry?.kind !== "subject") {
      continue;
    }
    for (const cluster of entry.subject.clusters) {
      if (!cluster.id.startsWith("concept-group-")) {
        continue;
      }
      const only = cluster.topics[0];
      if (only?.hideSidebarConcepts) {
        offenders.push(`${subject.track}/${subject.slug}/${cluster.id}:hidden`);
      }
      if (!conspectSubjectHubSectionWithConcepts(cluster, entry.subject.href)) {
        offenders.push(`${subject.track}/${subject.slug}/${cluster.id}:no-hub`);
      }
    }
  }

  assert.deepEqual(offenders, []);
});
