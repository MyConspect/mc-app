import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handbookNavForTrack, handbookNavSections } from "@/lib/nav/handbook";
import { navGroupsForRootSection } from "@/lib/nav/sections";
import { locationForPath } from "./active";

describe("locationForPath", () => {
  it("treats #utility-types on the TypeScript hub as the section, not the catalog cluster", () => {
    const groups = handbookNavForTrack("en", "frontend");
    const subjectHref = "/en/frontend/typescript";
    const location = locationForPath(groups, subjectHref, "#utility-types");
    assert.equal(location.sectionKey, `${subjectHref}#utility-types`);
    assert.equal(location.clusterKey, null);
    assert.equal(location.topicHref, null);
  });

  it("opens the Core intro cluster for a concept hash on the subject hub", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const subjectHref = "/en/frontend/core";
    const location = locationForPath(
      groups,
      subjectHref,
      "#navigation-and-fetching",
    );
    assert.equal(location.subjectHref, subjectHref);
    assert.equal(
      location.clusterKey,
      `${subjectHref}#concept-group-work-principles`,
    );
    assert.equal(location.topicHref, subjectHref);
  });

  it("opens the HTML document cluster for a child topic on the subject hub", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const subjectHref = "/en/frontend/html";
    const location = locationForPath(groups, subjectHref, "#document");
    assert.equal(location.subjectHref, subjectHref);
    assert.equal(location.clusterKey, `${subjectHref}#document`);
  });

  it("pins the Node.js Modules cluster when reading a concept on the topic URL", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const topicHref = "/en/backend/nodejs-modules";
    const location = locationForPath(
      groups,
      topicHref,
      "#require-and-packages",
    );
    assert.equal(location.subjectHref, "/en/backend/nodejs");
    assert.equal(
      location.clusterKey,
      `${topicHref}#concept-group-modules-package-management`,
    );
    assert.equal(location.topicHref, topicHref);
  });

  it("opens SQL section fold on the database-sql topic URL", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const topicHref = "/en/databases/database-sql";
    const location = locationForPath(groups, topicHref, "#concept-group-intro");
    assert.equal(location.subjectHref, "/en/databases");
    assert.equal(location.clusterKey, `${topicHref}#concept-group-intro`);
    assert.equal(location.topicHref, topicHref);
  });
});
