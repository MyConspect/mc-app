import assert from "node:assert/strict";
import test from "node:test";
import { getSubject, subjectSectionClusterCards } from "@/lib/catalog";
import { localizedClusterSectionsForSubject } from "./localizeSubjectClusters";
import { flattenSubjectClusterSectionsForIndex } from "./flattenSubjectClusterSections";

test("flatten merges flatNav Reference into one index section", () => {
  const html = getSubject("frontend", "html");
  assert.ok(html);
  const rootSections = localizedClusterSectionsForSubject("en", html, []);
  const groupedSections = subjectSectionClusterCards(html).map((entry) => ({
    section: entry.section,
    clusters: localizedClusterSectionsForSubject("en", html, entry.clusters),
  }));
  const flat = flattenSubjectClusterSectionsForIndex({
    rootSections,
    groupedSections,
  });
  const reference = flat.find((section) => section.cluster.id === "reference");
  assert.equal(reference?.cluster.title, "Reference");
  assert.deepEqual(
    reference?.items.map((item) => item.title),
    [
      "Elements",
      "Attributes",
      "Global attributes",
      "Attributes by element",
      "Attribute values",
    ],
  );
  assert.equal(
    flat.some((section) => section.cluster.id === "ref-elements"),
    false,
  );
});
