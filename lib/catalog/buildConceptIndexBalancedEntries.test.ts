import assert from "node:assert/strict";
import test from "node:test";
import { buildConceptIndexBalancedEntries } from "@/components/topic/buildConceptIndexBalancedEntries";
import type { SubjectClusterSection } from "./clusterConceptIndex";
import { chromeFor } from "@/lib/i18n/chrome";
import type { Concept } from "@/lib/parse";

const chrome = chromeFor("en");

test("intro index lists concept groups before cluster sections", () => {
  const concepts: Concept[] = [
    {
      id: "navigation-and-fetching",
      title: "Navigation and fetching",
      group: "Work Principles",
      html: "",
      interviewSection: undefined,
      hasOptionalDepth: false,
    },
  ];
  const sections: SubjectClusterSection[] = [
    {
      cluster: { id: "accessibility", title: "Accessibility", blurb: "" },
      items: [
        {
          href: "/en/frontend/html-a11y",
          title: "Accessibility",
          description: "",
        },
      ],
    },
  ];
  const entries = buildConceptIndexBalancedEntries({
    clusterLayout: { sections },
    concepts,
    groupInterviewSections: true,
    chrome,
    pathname: "/en/frontend/core",
  });
  assert.ok(entries.length >= 2);
  assert.match(String(entries[0]!.key), /^concept:/);
  assert.match(String(entries[1]!.key), /^cluster:/);
});
