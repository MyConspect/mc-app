import assert from "node:assert/strict";
import test from "node:test";
import type { NavTopic } from "@/lib/nav";
import {
  aggregatedNavConceptIds,
  isNavParentHubRow,
  navRowsBySlug,
} from "./sidebarOutlines";

test("isNavParentHubRow detects nested hub leaves", () => {
  const hub: NavTopic = {
    slug: "js-core-hub",
    href: "/en/frontend/js-core-hub",
    title: "Core",
    blurb: "",
    concepts: [],
    nestedTopics: [
      {
        slug: "js-core",
        href: "/en/frontend/js-core",
        title: "Language",
        blurb: "",
        concepts: [{ id: "a", title: "A" }],
      },
    ],
  };
  assert.equal(isNavParentHubRow(hub), true);
});

test("aggregatedNavConceptIds merges title-twin group rows", () => {
  const rows: NavTopic[] = [
    {
      slug: "core-browser-platform",
      href: "/en/frontend/core",
      title: "Core",
      blurb: "",
      concepts: [{ id: "browser-work-principles", title: "Browser work principles" }],
    },
    {
      slug: "core-browser-platform",
      href: "/en/frontend/core",
      title: "Work Principles",
      blurb: "",
      concepts: [{ id: "navigation-and-fetching", title: "Navigation and fetching" }],
    },
  ];
  assert.deepEqual(aggregatedNavConceptIds(rows), [
    "browser-work-principles",
    "navigation-and-fetching",
  ]);
});

test("navRowsBySlug collects duplicate slug rows", () => {
  const map = navRowsBySlug([
    {
      slug: "x",
      href: "/a",
      title: "A",
      blurb: "",
      concepts: [{ id: "1", title: "1" }],
    },
    {
      slug: "x",
      href: "/a",
      title: "B",
      blurb: "",
      concepts: [{ id: "2", title: "2" }],
    },
  ]);
  assert.equal(map.get("x")?.length, 2);
});