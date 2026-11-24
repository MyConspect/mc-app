import assert from "node:assert/strict";
import test from "node:test";
import { withDatabaseNosqlCoreConceptGroups } from "./databaseNosqlIntro";

test("drops Intro and NoSQL foundations groups on database-nosql-core", () => {
  const outline = withDatabaseNosqlCoreConceptGroups([
    { title: "NoSQL (concept)", group: "NoSQL foundations" },
    { title: "Elasticsearch", group: "Intro" },
    { title: "DB selection matrix" },
  ]);
  assert.equal(outline.every((entry) => entry.group === undefined), true);
});