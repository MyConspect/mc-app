import assert from "node:assert/strict";
import test from "node:test";
import { handbookNavSections } from "@/lib/nav/handbook";
import { activeTrackIdForActiveSection } from "./useSidebarOpen";

const sections = handbookNavSections("en");

test("activeTrackIdForActiveSection matches conspect Frontend on interviews URL", () => {
  assert.equal(
    activeTrackIdForActiveSection(
      sections,
      "conspect",
      "/en/interviews/frontend/web-security-questions",
    ),
    "frontend",
  );
});

test("activeTrackIdForActiveSection is null for unrelated path in tab", () => {
  assert.equal(
    activeTrackIdForActiveSection(sections, "conspect", "/en/interviews"),
    null,
  );
});

test("activeTrackIdForActiveSection does not mark CS when URL is Frontend", () => {
  assert.notEqual(
    activeTrackIdForActiveSection(
      sections,
      "conspect",
      "/en/frontend/js-core",
    ),
    "computer-science",
  );
  assert.equal(
    activeTrackIdForActiveSection(sections, "conspect", "/en/frontend/js-core"),
    "frontend",
  );
});