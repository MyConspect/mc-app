import assert from "node:assert/strict";
import test from "node:test";
import { conceptGroupSectionDomId } from "@/lib/nav/conceptGroupSection";
import { clusterTrailCrumbs, subjectHubClusterCrumbs } from "./shared";

test("clusterTrailCrumbs keeps intro concept-group sections in the trail", () => {
  const id = conceptGroupSectionDomId("Work Principles");
  const crumbs = clusterTrailCrumbs({
    id,
    title: "Work Principles",
    href: `/en/frontend/core#${id}`,
    topics: [
      {
        slug: "browser-core",
        href: "/en/frontend/core",
        title: "Work Principles",
        blurb: "",
        concepts: [],
      },
    ],
  });
  assert.equal(crumbs.length, 1);
  assert.equal(crumbs[0]?.label, "Work Principles");
});

test("subjectHubClusterCrumbs adds title-twin cluster on subject hub hash", () => {
  const subjectHref = "/en/frontend/css";
  const crumbs = subjectHubClusterCrumbs(
    {
      id: "layout",
      title: "Layout",
      href: "/en/frontend/css-layout",
      topics: [
        {
          slug: "css-layout",
          href: "/en/frontend/css-layout",
          title: "Layout",
          blurb: "",
          concepts: [],
        },
      ],
    },
    { href: subjectHref },
    subjectHref,
  );
  assert.equal(crumbs.length, 1);
  assert.equal(crumbs[0]?.label, "Layout");
  assert.equal(crumbs[0]?.href, `${subjectHref}#layout`);
});
