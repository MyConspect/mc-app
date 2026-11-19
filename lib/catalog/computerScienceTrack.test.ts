import assert from "node:assert/strict";
import test from "node:test";
import { SUBJECTS, TRACK_IDS, getTrack, trackBrowseCards } from "./index";

test("computer-science is first conspect track with four subject hubs", () => {
  assert.equal(TRACK_IDS[0], "computer-science");
  const track = getTrack("computer-science");
  assert.ok(track);
  assert.match(track.description, /Data structures/i);

  const subjects = SUBJECTS.filter((s) => s.track === "computer-science").map(
    (s) => s.slug,
  );
  assert.deepEqual(subjects, [
    "core",
    "data-structures",
    "algorithms",
    "system-design",
  ]);

  const cards = trackBrowseCards("computer-science");
  assert.deepEqual(
    cards.map((c) => c.title),
    ["Core", "Data Structures", "Algorithms", "System design"],
  );
});