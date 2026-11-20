import test from "node:test";
import assert from "node:assert/strict";
import { ensureConceptIndexListTitles } from "./ensureConceptIndexListTitles";

test("ensureConceptIndexListTitles inserts leading group heading", () => {
  const items = [
    { href: "/a#1", title: "One", description: "" },
    {
      href: "/a#g",
      title: "Group",
      description: "",
      indexRowKind: "group-heading" as const,
    },
    { href: "/a#2", title: "Two", description: "" },
  ];
  const next = ensureConceptIndexListTitles(items, {
    leadingGroupTitle: "Overview",
    leadingGroupHref: "/a",
  });
  assert.equal(next[0]?.indexRowKind, "group-heading");
  assert.equal(next[0]?.title, "Overview");
  assert.equal(next[2]?.title, "Group");
});

test("ensureConceptIndexListTitles wraps flat list when section h2 is hidden", () => {
  const items = [
    { href: "/x", title: "Alpha", description: "" },
    { href: "/y", title: "Beta", description: "" },
  ];
  const next = ensureConceptIndexListTitles(items, {
    wrapFlatListTitle: "SDLC",
    wrapFlatListHref: "/ai/sdlc",
    sectionHeadingVisible: false,
  });
  assert.equal(next.length, 3);
  assert.equal(next[0]?.indexRowKind, "group-heading");
  assert.equal(next[0]?.title, "SDLC");
});

test("ensureConceptIndexListTitles leaves flat list when section h2 is visible", () => {
  const items = [{ href: "/x", title: "Alpha", description: "" }];
  const next = ensureConceptIndexListTitles(items, {
    wrapFlatListTitle: "Unused",
    sectionHeadingVisible: true,
  });
  assert.deepEqual(next, items);
});