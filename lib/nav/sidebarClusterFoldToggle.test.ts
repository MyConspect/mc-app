import assert from "node:assert/strict";
import test from "node:test";
import { conceptGroupSectionDomId } from "./conceptGroupSection";
import {
  clusterFoldOpenForClusterRow,
  offHubClusterFoldCollapse,
  subjectHubClusterFoldClick,
  topicPageClusterFoldClick,
} from "./sidebarClusterFoldToggle";

const foldKey = "/en/databases:additional";
const groupId = conceptGroupSectionDomId("Web Security");

test("subject hub toggles closed when fold already open", () => {
  const open = clusterFoldOpenForClusterRow(foldKey, foldKey, "additional");
  assert.equal(open, true);

  const click = subjectHubClusterFoldClick(
    foldKey,
    foldKey,
    "additional",
    "#additional",
    true,
    true,
  );
  assert.equal(click.closing, true);
  assert.equal(click.clusterKey, null);
  assert.equal(click.replaceHashWith, "");
});

test("subject hub opens when fold closed without requiring hash", () => {
  const click = subjectHubClusterFoldClick(
    null,
    foldKey,
    "additional",
    "#additional",
    false,
    false,
  );
  assert.equal(click.closing, false);
  assert.equal(click.clusterKey, foldKey);
  assert.equal(click.replaceHashWith, "#additional");
});

test("subject hub second click closes even if hash not synced yet", () => {
  const click = subjectHubClusterFoldClick(
    foldKey,
    foldKey,
    "additional",
    "#additional",
    false,
    false,
  );
  assert.equal(click.closing, true);
  assert.equal(click.clusterKey, null);
  assert.equal(click.replaceHashWith, null);
});

test("catalog cluster id does not count as fold-open for concept-group sections", () => {
  assert.equal(
    clusterFoldOpenForClusterRow(foldKey, foldKey, groupId),
    false,
  );
});

test("topic page cluster fold toggles like subject hub", () => {
  const topicKey = "/en/databases/sql:concept-group-joins";
  const click = topicPageClusterFoldClick(
    topicKey,
    topicKey,
    "#concept-group-joins",
    true,
    false,
  );
  assert.equal(click.closing, true);
  assert.equal(click.clusterKey, null);
  assert.equal(click.replaceHashWith, "");
});

test("off-hub cluster click collapses when already open", () => {
  assert.equal(offHubClusterFoldCollapse(foldKey, foldKey), true);
  assert.equal(offHubClusterFoldCollapse(null, foldKey), false);
});