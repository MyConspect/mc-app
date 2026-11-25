import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldUsePendingNavPath } from "./pendingHighlight";

test("shouldUsePendingNavPath keeps same-section optimistic path", () => {
  assert.equal(
    shouldUsePendingNavPath(
      "/en/conspect/data-structures/arrays",
      "/en/conspect/data-structures/arrays",
    ),
    true,
  );
});

test("shouldUsePendingNavPath ignores empty pending", () => {
  assert.equal(
    shouldUsePendingNavPath("/en/conspect/data-structures/arrays", ""),
    false,
  );
});

test("shouldUsePendingNavPath matches prefixed vs rewritten interview path", () => {
  assert.equal(
    shouldUsePendingNavPath(
      "/en/backend/express-questions",
      "/en/interviews/backend/express-questions",
    ),
    true,
  );
});