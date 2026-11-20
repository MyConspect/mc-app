import assert from "node:assert/strict";
import test from "node:test";
import { splitTextByQuery } from "./splitTextByQuery";

test("splitTextByQuery returns full text when query empty", () => {
  assert.deepEqual(splitTextByQuery("Core", ""), [{ text: "Core", match: false }]);
});

test("splitTextByQuery marks case-insensitive matches", () => {
  assert.deepEqual(splitTextByQuery("Computer Core", "core"), [
    { text: "Computer ", match: false },
    { text: "Core", match: true },
  ]);
});

test("splitTextByQuery escapes regex metacharacters in query", () => {
  assert.deepEqual(splitTextByQuery("a+b", "a+b"), [
    { text: "a+b", match: true },
  ]);
});

test("splitTextByQuery highlights each whitespace-separated token", () => {
  assert.deepEqual(splitTextByQuery("Programming", "programming para"), [
    { text: "Programming", match: true },
  ]);
  assert.deepEqual(splitTextByQuery("Programming paradigm", "programming para"), [
    { text: "Programming", match: true },
    { text: " ", match: false },
    { text: "para", match: true },
    { text: "digm", match: false },
  ]);
  assert.deepEqual(
    splitTextByQuery("Procedural programming", "programming para"),
    [
      { text: "Procedural ", match: false },
      { text: "programming", match: true },
    ],
  );
});

test("splitTextByQuery treats collapsed whitespace like a single separator", () => {
  assert.deepEqual(splitTextByQuery("Programming", "programming  para"), [
    { text: "Programming", match: true },
  ]);
});