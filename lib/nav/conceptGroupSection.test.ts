import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptGroupDisplayLabel,
  conceptGroupSectionDomId,
  sidebarGroupRepeatsTopicLabel,
} from "./conceptGroupSection";

test("conceptGroupDisplayLabel strips leading ordinals", () => {
  assert.equal(conceptGroupDisplayLabel("1. Foundations"), "Foundations");
  assert.equal(
    conceptGroupDisplayLabel("2. Distributed systems"),
    "Distributed systems",
  );
  assert.equal(conceptGroupDisplayLabel("Architecture"), "Architecture");
});

test("sidebarGroupRepeatsTopicLabel matches ordinals and topic title", () => {
  assert.equal(
    sidebarGroupRepeatsTopicLabel("9. OOP & SOLID", "OOP & SOLID"),
    true,
  );
  assert.equal(
    sidebarGroupRepeatsTopicLabel("DRY, KISS, YAGNI", "Design principles"),
    false,
  );
  assert.equal(
    sidebarGroupRepeatsTopicLabel("Design principles", "Design principles"),
    true,
  );
});

test("conceptGroupSectionDomId keeps full label slug", () => {
  assert.equal(
    conceptGroupSectionDomId("1. Foundations"),
    "concept-group-1-foundations",
  );
});
