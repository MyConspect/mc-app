import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS } from "@/lib/catalog";
import { filterSubjectClusterSectionsForIntro } from "@/lib/catalog/subjectIntroClusters";
import { SUBJECT_INTRO_OMIT_CLUSTER_IDS } from "@/lib/catalog/subjectIntroOmitIds";

test("SUBJECT_INTRO_OMIT_CLUSTER_IDS has no frontend/core overrides", () => {
  assert.equal(SUBJECT_INTRO_OMIT_CLUSTER_IDS["frontend/core"], undefined);
});

test("filterSubjectClusterSectionsForIntro keeps clusters without intro topic", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  const sections = [
    { cluster: { id: "platform", title: "Platform" } },
    { cluster: { id: "accessibility", title: "Accessibility" } },
  ];
  const filtered = filterSubjectClusterSectionsForIntro(core, sections, true);
  assert.equal(filtered.length, 2);
});

test("filterSubjectClusterSectionsForIntro keeps all clusters without intro", () => {
  const core = SUBJECTS.find((subject) => subject.slug === "core");
  assert.ok(core);
  const sections = [
    { cluster: { id: "platform", title: "Platform" } },
    { cluster: { id: "accessibility", title: "Accessibility" } },
  ];
  const filtered = filterSubjectClusterSectionsForIntro(core, sections, false);
  assert.equal(filtered.length, 2);
});
