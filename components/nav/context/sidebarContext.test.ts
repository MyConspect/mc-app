import assert from "node:assert/strict";
import test from "node:test";
import {
  navPathHighlighted,
  navPathPinned,
  navTopicRowFocusedHighlight,
  navTrackSubjectPathHighlight,
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

test("navTopicRowFocusedHighlight counts fold drill without URL active", () => {
  assert.equal(navTopicRowFocusedHighlight(false, false, true), true);
  assert.equal(navTopicRowFocusedHighlight(false, false, false), false);
});