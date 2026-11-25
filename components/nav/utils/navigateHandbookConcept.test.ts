import assert from "node:assert/strict";
import { test } from "node:test";
import { parseConceptLeafHref } from "./navigateHandbookConcept";

test("parseConceptLeafHref splits pathname and concept id", () => {
  assert.deepEqual(
    parseConceptLeafHref(
      "/en/interviews/backend/golang-questions#what-is-go-vet-and-when-would-you-use-it",
    ),
    {
      topicHref: "/en/interviews/backend/golang-questions",
      conceptId: "what-is-go-vet-and-when-would-you-use-it",
    },
  );
});

test("parseConceptLeafHref handles topic-only href", () => {
  assert.deepEqual(parseConceptLeafHref("/en/frontend/react-core"), {
    topicHref: "/en/frontend/react-core",
    conceptId: "",
  });
});