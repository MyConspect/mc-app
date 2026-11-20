import assert from "node:assert/strict";
import test from "node:test";
import { conceptIndexLayoutModeForEntries } from "./conceptIndexPaneLayoutMode";

test("conceptIndexLayoutModeForEntries uses newspaper for long single section", () => {
  assert.equal(
    conceptIndexLayoutModeForEntries([{ weight: 40, listItemCount: 45 }], {
      preferNewspaperFrom: 1,
    }),
    "newspaper",
  );
});

test("conceptIndexLayoutModeForEntries stacks short single section by default", () => {
  assert.equal(
    conceptIndexLayoutModeForEntries([{ weight: 3, listItemCount: 4 }]),
    "stack",
  );
});