import assert from "node:assert/strict";
import test from "node:test";
import { navTrackScope } from "@/lib/nav/sections";
import { focusedOpenTrackIdForSection } from "./useSidebarOpen";

test("focusedOpenTrackIdForSection reads sole open scope in tab", () => {
  assert.equal(
    focusedOpenTrackIdForSection(
      new Set([navTrackScope("interviews", "computer-science")]),
      "interviews",
    ),
    "computer-science",
  );
  assert.equal(
    focusedOpenTrackIdForSection(
      new Set([navTrackScope("interviews", "computer-science")]),
      "conspect",
    ),
    null,
  );
});