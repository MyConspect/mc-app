import assert from "node:assert/strict";
import test from "node:test";
import {
  clearConceptNavForPath,
  conceptBackHref,
  peekConceptBack,
  recordConceptNav,
} from "./conceptNavBack";

const path = "/en/conspect/browser-platform";

test("conceptBackHref returns topic index when opened from the list", () => {
  clearConceptNavForPath(path);
  recordConceptNav(path, "", "multi-process-architecture");
  assert.equal(conceptBackHref(path, "multi-process-architecture"), path);
  assert.equal(peekConceptBack(path, "multi-process-architecture"), "");
});

test("conceptBackHref follows next/previous within the topic", () => {
  clearConceptNavForPath(path);
  recordConceptNav(path, "", "event-loop");
  recordConceptNav(path, "event-loop", "multi-process-architecture");
  assert.equal(
    conceptBackHref(path, "multi-process-architecture"),
    `${path}#event-loop`,
  );
});

test("clearConceptNavForPath drops entries for one topic", () => {
  clearConceptNavForPath(path);
  recordConceptNav(path, "", "a");
  clearConceptNavForPath(path);
  assert.equal(conceptBackHref(path, "a"), null);
});
