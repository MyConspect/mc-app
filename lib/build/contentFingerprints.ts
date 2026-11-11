import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  TOPICS,
  TRACKS,
  hubFileForTrack,
  type TrackId,
} from "@/lib/catalog";
import { LOCALES } from "@/lib/i18n/locales";
import { PARSE_LOGIC_REVISION } from "@/lib/parse/load";
import { resourcesRoot } from "@/lib/resourcesRoot";

const BUILD_STATE_VERSION = 1;

export type ContentBuildState = {
  readonly version: number;
  readonly logicRevision: number;
  readonly tracks: Readonly<Record<string, string>>;
};

export function contentBuildStatePath(): string {
  return path.join(
    process.cwd(),
    "public",
    "search-index",
    ".build-state.json",
  );
}

export function contentDirtyTracksPath(): string {
  return path.join(
    process.cwd(),
    "public",
    "search-index",
    ".dirty-tracks.json",
  );
}

export type ContentDirtyTracksRun = {
  readonly skipped: boolean;
  readonly trackIds: readonly string[];
};

export function writeDirtyTracksRun(run: ContentDirtyTracksRun): void {
  const file = contentDirtyTracksPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(run), "utf8");
}

export function readDirtyTracksRun(): ContentDirtyTracksRun | null {
  const file = contentDirtyTracksPath();
  if (!fs.existsSync(file)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as ContentDirtyTracksRun;
  } catch {
    return null;
  }
}

function topicFilesForTrack(trackId: TrackId): readonly string[] {
  const files = new Set<string>();
  const hub = hubFileForTrack(trackId);
  if (hub) {
    files.add(hub);
  }
  for (const topic of TOPICS) {
    if (topic.track === trackId) {
      files.add(topic.file);
    }
  }
  return [...files].sort();
}

function localeFileFingerprint(file: string, locale: string): string {
  const abs = path.join(resourcesRoot(), locale, file);
  if (!fs.existsSync(abs)) {
    return `${locale}:missing`;
  }
  const stat = fs.statSync(abs);
  return `${locale}:${stat.mtimeMs}:${stat.size}`;
}

export function fingerprintTrack(trackId: TrackId): string {
  const parts = topicFilesForTrack(trackId).flatMap((file) =>
    LOCALES.map((locale) => `${file}\t${localeFileFingerprint(file, locale)}`),
  );
  const body = [String(PARSE_LOGIC_REVISION), String(BUILD_STATE_VERSION), ...parts].join(
    "\n",
  );
  return createHash("sha256").update(body).digest("hex").slice(0, 20);
}

export function fingerprintAllTracks(): Record<TrackId, string> {
  const tracks = {} as Record<TrackId, string>;
  for (const track of TRACKS) {
    tracks[track.id] = fingerprintTrack(track.id);
  }
  return tracks;
}

export function loadContentBuildState(): ContentBuildState | null {
  const file = contentBuildStatePath();
  if (!fs.existsSync(file)) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as ContentBuildState;
    if (parsed.version !== BUILD_STATE_VERSION) {
      return null;
    }
    if (parsed.logicRevision !== PARSE_LOGIC_REVISION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveContentBuildState(
  tracks: Readonly<Record<string, string>>,
): void {
  const file = contentBuildStatePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const state: ContentBuildState = {
    version: BUILD_STATE_VERSION,
    logicRevision: PARSE_LOGIC_REVISION,
    tracks: { ...tracks },
  };
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
}

export function tracksNeedingSearchIndexRebuild(
  previous: ContentBuildState | null,
  next: Readonly<Record<string, string>>,
): TrackId[] {
  if (!previous) {
    return TRACKS.map((track) => track.id);
  }
  return TRACKS.filter((track) => previous.tracks[track.id] !== next[track.id]).map(
    (track) => track.id,
  );
}

export function fullContentBuildForced(): boolean {
  const flag = process.env.FULL_CONTENT_BUILD?.trim().toLowerCase();
  return flag === "1" || flag === "true";
}
