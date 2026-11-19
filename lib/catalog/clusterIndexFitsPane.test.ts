import assert from "node:assert/strict";
import test from "node:test";
import {
  clusterIndexFitsPane,
  clusterIndexShouldLockPaneHeight,
  clusterSectionListWeight,
} from "./clusterIndexFitsPane";
import type { SubjectClusterSection } from "./clusterConceptIndex";

test("clusterIndexFitsPane respects pane height and columns", () => {
  assert.equal(clusterIndexFitsPane(20, 700, 1), true);
  assert.equal(clusterIndexFitsPane(200, 500, 1), false);
  assert.equal(clusterIndexFitsPane(30, 500, 2), true);
});

test("clusterIndexShouldLockPaneHeight leaves slack for tall indexes", () => {
  assert.equal(clusterIndexShouldLockPaneHeight(12, 700, 1), true);
  assert.equal(clusterIndexShouldLockPaneHeight(88, 640, 4), false);
});

test("clusterSectionListWeight counts group headings", () => {
  const section: SubjectClusterSection = {
    cluster: { id: "x", title: "Architecture", blurb: "" },
    items: [
      { href: "#a", title: "Styles", indexRowKind: "group-heading" },
      { href: "#b", title: "Monolith" },
    ],
  };
  assert.equal(clusterSectionListWeight(section), 5);
});