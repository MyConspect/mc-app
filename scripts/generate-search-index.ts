import "./load-env";
import fs from "node:fs";
import path from "node:path";
import {
  fingerprintAllTracks,
  fullContentBuildForced,
  loadContentBuildState,
  saveContentBuildState,
  tracksNeedingSearchIndexRebuild,
  writeDirtyTracksRun,
} from "@/lib/build/contentFingerprints";
import { TRACKS, type TrackId } from "@/lib/catalog";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { handbookNavForTrack } from "@/lib/nav/handbook";

const OUTPUT_ROOT = path.join(process.cwd(), "public", "search-index");

function writeTrackIndex(locale: Locale, trackId: TrackId): number {
  const groups = handbookNavForTrack(locale, trackId);
  if (groups.length === 0) {
    return 0;
  }
  const dir = path.join(OUTPUT_ROOT, locale);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${trackId}.json`);
  const payload = JSON.stringify(groups);
  fs.writeFileSync(file, payload, "utf8");
  return payload.length;
}

function rewriteManifest(locale: Locale, trackIds: readonly TrackId[]): void {
  const manifestDir = path.join(OUTPUT_ROOT, locale);
  fs.mkdirSync(manifestDir, { recursive: true });
  const existingTracks = trackIds.filter((trackId) =>
    fs.existsSync(path.join(manifestDir, `${trackId}.json`)),
  );
  fs.writeFileSync(
    path.join(manifestDir, "manifest.json"),
    JSON.stringify({ tracks: existingTracks }),
    "utf8",
  );
}

function listIndexedTracks(locale: Locale): TrackId[] {
  const dir = path.join(OUTPUT_ROOT, locale);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return TRACKS.map((track) => track.id).filter((trackId) =>
    fs.existsSync(path.join(dir, `${trackId}.json`)),
  );
}

function main() {
  const nextFingerprints = fingerprintAllTracks();
  const previous = loadContentBuildState();
  const dirtyTracks = fullContentBuildForced()
    ? TRACKS.map((track) => track.id)
    : tracksNeedingSearchIndexRebuild(previous, nextFingerprints);

  if (dirtyTracks.length === 0) {
    writeDirtyTracksRun({ skipped: true, trackIds: [] });
    console.log("search-index: up to date (no mc-content or catalog changes)");
    return;
  }

  if (fullContentBuildForced() || !previous) {
    if (fs.existsSync(OUTPUT_ROOT)) {
      fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true });
    }
  }

  let files = 0;
  let bytes = 0;

  for (const trackId of dirtyTracks) {
    for (const locale of LOCALES) {
      const size = writeTrackIndex(locale, trackId);
      if (size === 0) {
        continue;
      }
      files += 1;
      bytes += size;
    }
  }

  for (const locale of LOCALES) {
    rewriteManifest(locale, listIndexedTracks(locale));
  }

  saveContentBuildState(nextFingerprints);
  writeDirtyTracksRun({ skipped: false, trackIds: dirtyTracks });

  const scope =
    dirtyTracks.length === TRACKS.length
      ? "all tracks"
      : dirtyTracks.join(", ");
  console.log(
    `search-index: rebuilt ${scope} — ${files} file(s) (${(bytes / 1024 / 1024).toFixed(2)} MB this run)`,
  );
}

main();
