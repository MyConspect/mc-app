import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handbookNavForTrack, handbookNavSections } from "@/lib/nav/handbook";
import { navGroupsForRootSection } from "@/lib/nav/sections";
import {
  isConceptActiveOnPage,
  isOnSubjectPath,
  locationForPath,
} from "./active";

describe("isOnSubjectPath", () => {
  it("matches child topic URL under a conspect subject", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const topicHref = "/en/backend/nodejs-modules";
    const subjectHref = "/en/backend/nodejs";
    const nodejs = groups
      .find((group) => group.id === "backend")
      ?.entries.find(
        (entry) =>
          entry.kind === "subject" && entry.subject.href === subjectHref,
      );
    assert.ok(nodejs && nodejs.kind === "subject");
    assert.equal(isOnSubjectPath(topicHref, nodejs.subject, ""), true);
    assert.equal(isOnSubjectPath(subjectHref, nodejs.subject, ""), true);
  });

  it("matches subject hub when activeConceptId lives under the subject", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const topicHref = "/en/backend/nodejs-modules";
    const conceptId = "require-and-packages";
    const subjectHref = "/en/backend/nodejs";
    const nodejs = groups
      .find((group) => group.id === "backend")
      ?.entries.find(
        (entry) =>
          entry.kind === "subject" && entry.subject.href === subjectHref,
      );
    assert.ok(nodejs && nodejs.kind === "subject");
    assert.equal(
      isOnSubjectPath(subjectHref, nodejs.subject, conceptId),
      true,
    );
    assert.equal(
      isOnSubjectPath(topicHref, nodejs.subject, conceptId),
      true,
    );
    const location = locationForPath(
      groups,
      topicHref,
      `#${conceptId}`,
    );
    assert.equal(location.subjectHref, subjectHref);
  });
});

describe("isConceptActiveOnPage", () => {
  it("matches concept when URL has conspect section prefix", () => {
    const topicHref = "/en/ai/cursor-skills";
    assert.equal(
      isConceptActiveOnPage(
        "/en/conspect/ai/cursor-skills",
        topicHref,
        "scoping-with-paths",
        "scoping-with-paths",
      ),
      true,
    );
  });
});

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

  it("resolves subject hub with conspect section prefix", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const location = locationForPath(
      groups,
      "/en/conspect/computer-science/algorithms",
      "",
    );
    assert.equal(location.subjectHref, "/en/computer-science/algorithms");
    assert.equal(location.clusterKey, null);
  });

  it("pins Core sibling topic fold on js-operators, not js-core-hub", () => {
    const groups = navGroupsForRootSection(
      handbookNavSections("en"),
      "conspect",
    );
    const location = locationForPath(
      groups,
      "/en/frontend/js-operators",
      "",
    );
    assert.equal(location.subjectHref, "/en/frontend/javascript");
    assert.equal(location.clusterKey, "/en/frontend/javascript#core");
    assert.equal(location.topicHref, "/en/frontend/js-operators");
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
