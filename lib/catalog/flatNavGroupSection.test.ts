import assert from "node:assert/strict";
import test from "node:test";
import { getSubject, subjectSectionClusterCards } from "@/lib/catalog";
import { localizedClusterSectionsForSubject } from "./localizeSubjectClusters";
import {
  flatNavGroupBrowseCards,
  subjectClusterSectionForFlatNavGroup,
} from "./flatNavGroupSection";

test("flatNav Reference builds one link per appendix cluster", () => {
  const html = getSubject("frontend", "html");
  assert.ok(html);
  const grouped = subjectSectionClusterCards(html);
  const reference = grouped.find((entry) => entry.section.id === "reference");
  assert.ok(reference);
  const clusters = localizedClusterSectionsForSubject(
    "en",
    html,
    reference.clusters,
  );
  const cards = flatNavGroupBrowseCards(clusters);
  assert.deepEqual(
    cards.map((card) => card.title),
    [
      "Elements",
      "Attributes",
      "Global attributes",
      "Attributes by element",
      "Attribute values",
    ],
  );
  assert.ok(cards.every((card) => card.href.startsWith("/en/")));
});

test("flatNav group wraps as a single index section", () => {
  const html = getSubject("frontend", "html");
  assert.ok(html);
  const grouped = subjectSectionClusterCards(html);
  const reference = grouped.find((entry) => entry.section.id === "reference");
  assert.ok(reference);
  const clusters = localizedClusterSectionsForSubject(
    "en",
    html,
    reference.clusters,
  );
  const section = subjectClusterSectionForFlatNavGroup(
    "reference",
    "Reference",
    clusters,
  );
  assert.equal(section.cluster.title, "Reference");
  assert.equal(section.items.length, 5);
});
