import assert from "node:assert/strict";
import test from "node:test";
import { interviewGroupDisplayTitle } from "./conceptIndexGroups";

test("interviewGroupDisplayTitle strips Interview prefix and subject name", () => {
  assert.equal(
    interviewGroupDisplayTitle(
      "Interview JavaScript Fundamentals",
      "JavaScript",
    ),
    "Fundamentals",
  );
  assert.equal(
    interviewGroupDisplayTitle("JavaScript Fundamentals", "JavaScript"),
    "Fundamentals",
  );
});

test("interviewGroupDisplayTitle leaves topic-agnostic section names", () => {
  assert.equal(
    interviewGroupDisplayTitle("Related topics", "TypeScript"),
    "Related topics",
  );
  assert.equal(
    interviewGroupDisplayTitle(
      "DOM Manipulation and Browser APIs",
      "JavaScript",
    ),
    "DOM Manipulation and Browser APIs",
  );
});

test("interviewGroupDisplayTitle removes embedded Interview and subject words", () => {
  assert.equal(
    interviewGroupDisplayTitle("Asynchronous JavaScript", "JavaScript"),
    "Asynchronous",
  );
  assert.equal(
    interviewGroupDisplayTitle(
      "Front-end Developer Interview (H5BP)",
      "JavaScript",
    ),
    "Front-end Developer (H5BP)",
  );
  assert.equal(
    interviewGroupDisplayTitle("Networking with JavaScript", "JavaScript"),
    "Networking with",
  );
  assert.equal(
    interviewGroupDisplayTitle("JavaScript and the DOM", "JavaScript"),
    "The DOM",
  );
});

test("interviewGroupDisplayTitle handles React Native section headings", () => {
  assert.equal(
    interviewGroupDisplayTitle("React Native Fundamentals", "React Native"),
    "Fundamentals",
  );
  assert.equal(
    interviewGroupDisplayTitle("Advanced React Native Topics", "React Native"),
    "Advanced Topics",
  );
});
