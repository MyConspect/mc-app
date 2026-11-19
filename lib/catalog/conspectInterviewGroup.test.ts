import assert from "node:assert/strict";
import test from "node:test";
import {
  filterConspectTheoryOutline,
  isConspectInterviewGroupLabel,
} from "./conspectInterviewGroup";

test("isConspectInterviewGroupLabel detects interview section titles", () => {
  assert.equal(
    isConspectInterviewGroupLabel(
      "Accessibility interview questions for 3 years experience",
    ),
    true,
  );
  assert.equal(isConspectInterviewGroupLabel("Work Principles"), false);
  assert.equal(isConspectInterviewGroupLabel("Selectors & Cascade"), false);
});

test("filterConspectTheoryOutline drops interview blocks and groups", () => {
  const outline = filterConspectTheoryOutline([
    { id: "a", title: "Theory", group: "Core" },
    {
      id: "b",
      title: "Q1",
      interviewSection: "questions",
    },
    {
      id: "c",
      title: "GFE",
      group: "Accessibility interview questions for 3 years experience",
    },
  ]);
  assert.equal(outline.length, 1);
  assert.equal(outline[0]?.title, "Theory");
});
