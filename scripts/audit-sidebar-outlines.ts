import "./load-env";
import {
  fullContentBuildForced,
  readDirtyTracksRun,
} from "@/lib/build/contentFingerprints";
import { TRACKS, type TrackId } from "@/lib/catalog";
import {
  auditSidebarOutlines,
  formatSidebarOutlineReport,
} from "../lib/audit/sidebarOutlines";

function main(): void {
  const run = readDirtyTracksRun();

  if (!fullContentBuildForced() && run?.skipped) {
    console.log("sidebar-outlines: skipped (no mc-content changes)");
    return;
  }

  const trackIds =
    run && !run.skipped && run.trackIds.length > 0
      ? (run.trackIds as TrackId[])
      : undefined;

  const mismatches = auditSidebarOutlines(
    trackIds && trackIds.length < TRACKS.length ? { trackIds } : {},
  );
  const report = formatSidebarOutlineReport(mismatches);
  process.stdout.write(`${report}\n`);
  if (mismatches.length > 0) {
    process.exit(1);
  }
}

main();
