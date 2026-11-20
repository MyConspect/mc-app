import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { subjectClusterSectionsForLocale } from "./localizeSubjectClusters";

test("every subject cluster section has a headingHref for EN", () => {
  for (const subject of SUBJECTS) {
    const sections = subjectClusterSectionsForLocale("en", subject);
    for (const section of sections) {
      assert.ok(
        section.headingHref && section.headingHref.length > 0,
        `${subject.slug}/${section.cluster.id}: missing headingHref`,
      );
      assert.ok(
        section.headingHref.startsWith("/en/"),
        `${subject.slug}/${section.cluster.id}: expected locale prefix`,
      );
    }
  }
});
