import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexShouldUseCompactShell } from "./conceptIndexCompactShell";

test("compact shell when single column and short painted height", () => {
  assert.equal(
    conceptIndexShouldUseCompactShell(false, false, 360, 1100, 1),
    true,
  );
});

test("no compact shell when multicol uses multiple columns", () => {
  assert.equal(
    conceptIndexShouldUseCompactShell(false, false, 360, 1100, 3),
    false,
  );
});

test("no compact shell when content fills pane", () => {
  assert.equal(
    conceptIndexShouldUseCompactShell(false, false, 1095, 1100, 1),
    false,
  );
});