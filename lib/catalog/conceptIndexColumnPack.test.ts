import assert from "node:assert/strict";
import test from "node:test";
import {
  applyInterstitialMiddleColumn,
  assignSectionsOnePerColumnWhenFits,
  collapseLoneTailColumn,
  conceptIndexRowsPerPane,
  packIndexSectionsIntoColumns,
  packSectionsBalanceHorizontally,
  packSectionsToPaneHeight,
  packSectionsToPaneHeightWithLargeListBreak,
  spreadSectionsAcrossViewportColumns,
} from "./conceptIndexColumnPack";

test("packSectionsBalanceHorizontally spreads across horizontal columns", () => {
  const pane = 640;
  const items = ["core", "modules", "http", "db", "sql", "orm"];
  const weights: Record<string, number> = {
    core: 15,
    modules: 8,
    http: 12,
    db: 10,
    sql: 8,
    orm: 5,
  };
  const packed = packSectionsBalanceHorizontally(
    items,
    pane,
    4,
    (id) => weights[id]!,
  );
  assert.equal(packed.length, 4);
  const flat = packed.flat();
  assert.equal(flat.length, items.length);
  const heights = packed.map((col) =>
    col.reduce((sum, id) => sum + weights[id]!, 0),
  );
  const max = Math.max(...heights);
  const min = Math.min(...heights);
  assert.ok(max - min <= 15);
});

test("packSectionsToPaneHeightWithLargeListBreak moves the next section after a long list", () => {
  type Item = { id: string; weight: number; items: number };
  const rows: Item[] = [
    { id: "core", weight: 15, items: 13 },
    { id: "modules", weight: 7, items: 5 },
    { id: "db-core", weight: 13, items: 11 },
    { id: "sql", weight: 9, items: 7 },
  ];
  const packed = packSectionsToPaneHeightWithLargeListBreak(
    rows,
    2000,
    4,
    (item) => item.weight,
    (item) => item.items,
    7,
  );
  assert.deepEqual(
    packed.map((track) => track.map((item) => item.id)),
    [["core"], ["modules", "db-core"], ["sql"]],
  );
});

test("packSectionsToPaneHeight opens a new track when the pane is full", () => {
  const pane = 640;
  const capacity = conceptIndexRowsPerPane(pane);
  const items = ["a", "b", "c", "d"];
  const weights = [capacity - 2, 4, 3, 2];
  const packed = packSectionsToPaneHeight(
    items,
    pane,
    4,
    (item) => weights[items.indexOf(item)]!,
  );
  assert.equal(packed.length, 2);
  assert.deepEqual(packed[0], ["a"]);
  assert.deepEqual(packed[1], ["b", "c", "d"]);
});

test("assignSectionsOnePerColumnWhenFits uses one track per section when counts match", () => {
  const items = ["core", "document", "browser", "additional"];
  assert.deepEqual(assignSectionsOnePerColumnWhenFits(items, 4), [
    ["core"],
    ["document"],
    ["browser"],
    ["additional"],
  ]);
  assert.equal(assignSectionsOnePerColumnWhenFits(items, 3), null);
  assert.deepEqual(assignSectionsOnePerColumnWhenFits(items.slice(0, 3), 3), [
    ["core"],
    ["document"],
    ["browser"],
  ]);
});

test("packIndexSectionsIntoColumns keeps a single column when columnCount is 1", () => {
  const items = ["a", "b", "c"];
  assert.deepEqual(
    packIndexSectionsIntoColumns(items, 1, () => 1),
    [items],
  );
});

test("spreadSectionsAcrossViewportColumns lays out Core across three tracks", () => {
  const items = [
    { id: "accessibility", weight: 15 },
    { id: "security", weight: 2 },
    { id: "work-principles", weight: 8 },
    { id: "browser-platform", weight: 7 },
  ];
  const packed = spreadSectionsAcrossViewportColumns(items, 3);
  assert.ok(packed);
  assert.deepEqual(
    packed[0]!.map((item) => item.id),
    ["accessibility"],
  );
  assert.deepEqual(
    packed[1]!.map((item) => item.id),
    ["security", "work-principles"],
  );
  assert.deepEqual(
    packed[2]!.map((item) => item.id),
    ["browser-platform"],
  );
});

test("applyInterstitialMiddleColumn moves a lone short section between tall stacks", () => {
  const packed = [
    [{ id: "accessibility", weight: 15 }],
    [
      { id: "security", weight: 2 },
      { id: "work-principles", weight: 8 },
    ],
    [{ id: "browser-platform", weight: 7 }],
  ];
  const laidOut = applyInterstitialMiddleColumn(packed, (item) => item.weight);
  assert.deepEqual(
    laidOut[1]!.map((item) => item.id),
    ["browser-platform"],
  );
  assert.deepEqual(
    laidOut[2]!.map((item) => item.id),
    ["security", "work-principles"],
  );
});

test("collapseLoneTailColumn stacks a lone short third column onto the middle", () => {
  const packed = [
    [{ id: "accessibility", weight: 15 }],
    [
      { id: "security", weight: 2 },
      { id: "work-principles", weight: 8 },
    ],
    [{ id: "browser-platform", weight: 7 }],
  ];
  const laidOut = collapseLoneTailColumn(packed, (item) => item.weight);
  assert.deepEqual(
    laidOut[1]!.map((item) => item.id),
    ["security", "work-principles", "browser-platform"],
  );
  assert.deepEqual(laidOut[2], []);
});
