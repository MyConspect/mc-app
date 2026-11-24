import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS, getTopic, subjectIntroTopicSlug } from "@/lib/catalog";
import { loadTopicOutline } from "@/lib/parse";
import { handbookNavForTrack } from "@/lib/nav/handbook";
import { crumbsForPath } from "@/components/nav/utils/location/crumbs";
import { conceptGroupSectionDomId } from "@/lib/nav/conceptGroupSection";
import { sameTitle } from "@/lib/nav/navUtils";
import {
  filterIntroConceptsForHashFocus,
  filterSubjectHubClusterLayout,
  resolveSubjectHubHashFocus,
} from "./filterSubjectHubByHash";
import { isConspectInterviewGroupLabel } from "./conspectInterviewGroup";
import { subjectClusterSectionsForLocale } from "./localizeSubjectClusters";

const crumbLabels = { home: "Home", instructions: "Instructions" };

test("no expanded group-heading row repeats its cluster section title", () => {
  for (const subject of SUBJECTS) {
    const sections = subjectClusterSectionsForLocale("en", subject);
    for (const section of sections) {
      for (const item of section.items) {
        if (item.indexRowKind !== "group-heading") {
          continue;
        }
        assert.ok(
          !sameTitle(item.title, section.cluster.title),
          `${subject.slug}/${section.cluster.id}: group-heading "${item.title}" duplicates cluster title`,
        );
      }
    }
  }
});

test("title-twin clusters are not interview-only when theory concepts exist", () => {
  const offenders: string[] = [];
  for (const subject of SUBJECTS) {
    const sections = subjectClusterSectionsForLocale("en", subject);
    for (const section of sections) {
      const nonInterview = section.items.filter(
        (item) => !isConspectInterviewGroupLabel(item.title),
      );
      const onlyInterview =
        section.items.length > 0 &&
        nonInterview.length === 0 &&
        section.items.some((item) => isConspectInterviewGroupLabel(item.title));
      if (onlyInterview) {
        offenders.push(`${subject.slug}/${section.cluster.id}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `clusters with interview row only and no theory bullets: ${offenders.join(", ")}`,
  );
});

test("frontend Core hub hash focuses catalog clusters", () => {
  const core = SUBJECTS.find(
    (subject) => subject.track === "frontend" && subject.slug === "core",
  );
  assert.ok(core);
  assert.equal(subjectIntroTopicSlug(core), undefined);
  const sections = subjectClusterSectionsForLocale("en", core);
  const layout = { sections };
  const topic = getTopic(core.track, "core-browser-platform");
  assert.ok(topic);
  const platformConcepts = loadTopicOutline(topic, "en");

  const platformFocus = resolveSubjectHubHashFocus({
    hashId: "platform",
    concepts: platformConcepts,
    clusterLayout: layout,
  });
  assert.equal(platformFocus.kind, "cluster");
  const platformClusters = filterSubjectHubClusterLayout(layout, platformFocus);
  assert.equal(platformClusters.sections?.length, 1);

  const a11yFocus = resolveSubjectHubHashFocus({
    hashId: "accessibility",
    concepts: platformConcepts,
    clusterLayout: layout,
  });
  assert.equal(a11yFocus.kind, "cluster");
  const a11yLayout = filterSubjectHubClusterLayout(layout, a11yFocus);
  assert.equal(a11yLayout.sections?.length, 1);
});

test("catalog cluster hash focus works on CSS subject hub", () => {
  const css = SUBJECTS.find((subject) => subject.slug === "css");
  assert.ok(css);
  const sections = subjectClusterSectionsForLocale("en", css);
  const focus = resolveSubjectHubHashFocus({
    hashId: "layout",
    concepts: [],
    clusterLayout: { sections },
  });
  assert.equal(focus.kind, "cluster");
  const filtered = filterSubjectHubClusterLayout({ sections }, focus);
  assert.equal(filtered.sections?.length, 1);
  assert.equal(filtered.sections?.[0]?.cluster.id, "layout");
});

test("CSS Selectors group hash includes parent Core in breadcrumbs", () => {
  const frontend = handbookNavForTrack("en", "frontend");
  const selectorsId = conceptGroupSectionDomId("Selectors & Cascade");
  const crumbs = crumbsForPath(
    frontend,
    "/en/frontend/css",
    `#${selectorsId}`,
    crumbLabels,
  ).map((c) => c.label);
  assert.deepEqual(crumbs, [
    "Home",
    "Frontend",
    "CSS",
    "Core",
    "Selectors & Cascade",
  ]);
});

test("breadcrumbs include focused intro group and catalog cluster on sample hubs", () => {
  const frontend = handbookNavForTrack("en", "frontend");
  const coreWork = conceptGroupSectionDomId("Work Principles");
  assert.deepEqual(
    crumbsForPath(
      frontend,
      "/en/frontend/core",
      `#${coreWork}`,
      crumbLabels,
    ).map((c) => c.label),
    ["Home", "Frontend", "Core", "Work Principles"],
  );
  assert.deepEqual(
    crumbsForPath(frontend, "/en/frontend/css", "#layout", crumbLabels).map(
      (c) => c.label,
    ),
    ["Home", "Frontend", "CSS", "Layout"],
  );

  const backend = handbookNavForTrack("en", "backend");
  assert.deepEqual(
    crumbsForPath(backend, "/en/backend/nodejs", "#core", crumbLabels).map(
      (c) => c.label,
    ),
    ["Home", "Backend", "Node.js", "Core"],
  );

  const cs = handbookNavForTrack("en", "computer-science");
  assert.deepEqual(
    crumbsForPath(
      cs,
      "/en/computer-science/system-design",
      "#principles",
      crumbLabels,
    ).map((c) => c.label),
    ["Home", "Computer Science", "System design", "Principles"],
  );
});
