import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS, subjectClusterCards } from "@/lib/catalog";
import { subjectClusterSectionsForLocale } from "./localizeSubjectClusters";

const CLUSTER_HUB_SUBJECTS = [
  {
    track: "backend",
    slug: "nodejs",
    clusters: ["core", "modules", "http", "additional"],
  },
  {
    track: "databases",
    slug: "database",
    clusters: ["core", "sql", "nosql", "orm", "additional"],
  },
  {
    track: "frontend",
    slug: "javascript",
    clusters: ["core", "browser", "async", "additional"],
  },
] as const;

for (const fixture of CLUSTER_HUB_SUBJECTS) {
  test(`${fixture.slug} subject index lists conspect cluster headings`, () => {
    const subject = SUBJECTS.find(
      (entry) => entry.track === fixture.track && entry.slug === fixture.slug,
    );
    assert.ok(subject, `missing subject ${fixture.slug}`);
    const sections = subjectClusterSectionsForLocale("en", subject);
    const ids = sections.map((section) => section.cluster.id);
    for (const clusterId of fixture.clusters) {
      assert.ok(
        ids.includes(clusterId),
        `missing cluster ${clusterId} on ${fixture.slug}, got ${ids.join(", ")}`,
      );
    }
    assert.equal(
      sections.some((section) => section.cluster.id === "interview"),
      false,
    );
    assert.ok(
      sections.every((section) => section.items.length > 0),
      "empty cluster section",
    );
  });
}

test("every subject with cluster cards exposes at least one index section", () => {
  for (const subject of SUBJECTS) {
    const cards = subjectClusterCards(subject);
    if (cards.length === 0) {
      continue;
    }
    const sections = subjectClusterSectionsForLocale("en", subject);
    assert.ok(
      sections.length > 0,
      `no index sections for ${subject.track}/${subject.slug}`,
    );
  }
});
