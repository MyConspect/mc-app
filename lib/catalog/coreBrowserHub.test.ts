import assert from "node:assert/strict";
import test from "node:test";
import {
  coreBrowserConceptSection,
  withCoreBrowserConceptGroups,
} from "./coreBrowserHub";

test("coreBrowserConceptSection maps concepts to Work Principles vs platform", () => {
  assert.equal(
    coreBrowserConceptSection("Navigation and fetching"),
    "Work Principles",
  );
  assert.equal(
    coreBrowserConceptSection("Browser platform architecture"),
    "Browser platform",
  );
  assert.equal(
    coreBrowserConceptSection("Security model overview"),
    "Browser platform",
  );
});

test("withCoreBrowserConceptGroups assigns groups in handbook order", () => {
  const items = withCoreBrowserConceptGroups([
    { title: "Work Principles" },
    { title: "Event loop and task queues" },
    { title: "Web platform stack (HTML, CSS, JavaScript)" },
  ]);
  assert.deepEqual(
    items.map((item) => [item.title, item.group ?? null]),
    [
      ["Work Principles", "Work Principles"],
      ["Event loop and task queues", "Work Principles"],
      ["Web platform stack (HTML, CSS, JavaScript)", "Browser platform"],
    ],
  );
});
