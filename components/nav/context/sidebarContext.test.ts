import assert from "node:assert/strict";
import test from "node:test";
import { NAV_NEST_STEP_2 } from "../constants/sidebarLayout";
import {
  navHighlightOffRouteDrill,
  navPathHighlighted,
  navPathHighlightedForTrack,
  navPathPinned,
  navTopicRowFocusedHighlight,
  navTrackPathChromeActive,
  navTrackChromeActive,
  navTrackPathRailActive,
  navTrackRouteActive,
  navTrackSubjectPathHighlight,
  rowClass,
  rowClassNested,
} from "./sidebarContext";

test("navPathPinned pins leaf on mobile when on path", () => {
  assert.equal(navPathPinned(true, true, false), true);
  assert.equal(navPathPinned(true, false, false), false);
});

test("navPathHighlighted includes onPath only when stackPathPins", () => {
  assert.equal(navPathHighlighted(false, true, false), false);
  assert.equal(navPathHighlighted(false, true, true), true);
  assert.equal(navPathHighlighted(true, false, false), true);
});

test("navTrackSubjectPathHighlight includes onPath on mobile", () => {
  assert.equal(navTrackSubjectPathHighlight(false, true, false), true);
  assert.equal(navTrackSubjectPathHighlight(false, false, false), false);
});

test("navTrackPathChromeActive only when open on route or section-home drill", () => {
  assert.equal(navTrackPathChromeActive(true, true, false), true);
  assert.equal(navTrackPathChromeActive(false, true, false), false);
  assert.equal(navTrackPathChromeActive(true, false, false), false);
  assert.equal(navTrackPathChromeActive(true, false, true), true);
});

test("navTrackRouteActive matches route id or section-home drill", () => {
  assert.equal(navTrackRouteActive("frontend", "frontend", false), true);
  assert.equal(navTrackRouteActive("frontend", "computer-science", false), false);
  assert.equal(navTrackRouteActive(null, "frontend", true), true);
});

test("navTrackChromeActive highlights focused drill track off URL route", () => {
  assert.equal(
    navTrackChromeActive(
      "computer-science",
      "frontend",
      "computer-science",
      false,
    ),
    true,
  );
  assert.equal(
    navTrackChromeActive("frontend", "frontend", "computer-science", false),
    false,
  );
  assert.equal(
    navTrackChromeActive("frontend", "frontend", "frontend", false),
    true,
  );
});

test("navTrackPathRailActive requires open fold on route track", () => {
  assert.equal(navTrackPathRailActive(true, true), true);
  assert.equal(navTrackPathRailActive(false, true), false);
  assert.equal(navTrackPathRailActive(true, false), false);
});

test("navHighlightOffRouteDrill blocks rows under browse-only open tracks", () => {
  assert.equal(navHighlightOffRouteDrill("frontend", "frontend"), false);
  assert.equal(navHighlightOffRouteDrill("computer-science", "frontend"), true);
  assert.equal(navHighlightOffRouteDrill("frontend", null), false);
});

test("navPathHighlightedForTrack suppresses off-route drill rows", () => {
  assert.equal(
    navPathHighlightedForTrack(
      "computer-science",
      "frontend",
      true,
      true,
      true,
    ),
    false,
  );
  assert.equal(
    navPathHighlightedForTrack("frontend", "frontend", true, false, true),
    true,
  );
});

test("navTopicRowFocusedHighlight counts fold drill without URL active", () => {
  assert.equal(navTopicRowFocusedHighlight(false, false, true), true);
  assert.equal(navTopicRowFocusedHighlight(false, false, false), false);
});

test("rowClass appends nest indent padding class", () => {
  const withIndent = rowClass(true, false, NAV_NEST_STEP_2);
  assert.match(withIndent, /\bpl-\[11px\]/);
  assert.match(withIndent, /\bbg-yellow-50\b/);
  const withoutNestIndent = rowClass(true);
  assert.doesNotMatch(withoutNestIndent, /\spl-(?:\[[0-9]+px\]|[234](?:\.5)?|6)\b/);
});

test("rowClassNested appends indent and uses nested row sizing", () => {
  const classes = rowClassNested(false, false, NAV_NEST_STEP_2);
  assert.match(classes, /\bpl-\[11px\]/);
  assert.match(classes, /\bpr-2\b/);
  assert.doesNotMatch(classes, /\bpx-2\b/);
  assert.match(classes, /\bmin-h-9\b/);
});

test("rowClassNested sticky adds sticky class", () => {
  assert.match(rowClassNested(true, true, ""), /\bsticky\b/);
});

test("inactive nested row uses lighter hover than primary row", () => {
  assert.match(rowClassNested(false), /hover:bg-yellow-50\/70/);
  assert.match(rowClass(false), /hover:bg-yellow-50\b/);
  assert.doesNotMatch(rowClass(false), /hover:bg-yellow-50\/70/);
});