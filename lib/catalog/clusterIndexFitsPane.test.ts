import assert from "node:assert/strict";
import test from "node:test";
import {
  balancedEntriesIndexStats,
  clusterIndexFitsPane,
  clusterIndexShouldLockPaneHeight,
  clusterSectionListWeight,
  conceptIndexPanePackOptionsForEntries,
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
      {
        href: "#a",
        title: "Styles",
        description: "",
        indexRowKind: "group-heading",
      },
      { href: "#b", title: "Monolith", description: "" },
    ],
  };
  assert.equal(clusterSectionListWeight(section), 5);
});

test("conceptIndexPanePackOptionsForEntries enables pane pack for multi-section hubs", () => {
  const entries = [
    { weight: 20, listItemCount: 18 },
    { weight: 6, listItemCount: 4 },
    { weight: 8, listItemCount: 6 },
  ];
  const stats = balancedEntriesIndexStats(entries);
  assert.equal(stats.listRowCount, 28);
  const options = conceptIndexPanePackOptionsForEntries(entries);
  assert.ok(options);
  assert.equal(options.oneTrackPerEntry, false);
  assert.equal(options.totalListWeight, stats.packWeight);
  const loneShort = conceptIndexPanePackOptionsForEntries([
    { weight: 4, listItemCount: 5 },
  ]);
  assert.equal(loneShort, undefined);
  const loneLong = conceptIndexPanePackOptionsForEntries([
    { weight: 40, listItemCount: 30 },
  ]);
  assert.ok(loneLong);
  assert.equal(loneLong?.oneTrackPerEntry, false);
});
