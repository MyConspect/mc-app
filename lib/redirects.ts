import { TRACK_IDS } from "./catalog";

export const TRACK_SEGMENT = TRACK_IDS.join("|");

export type HandbookRedirect = {
  readonly source: string;
  readonly destination: string;
  readonly permanent: boolean;
};

function legacyRedirect(source: string, destination: string): HandbookRedirect {
  return { source, destination, permanent: true };
}

/** Specific renames must be registered before the track catch-alls. Next uses the first match. */
export function handbookRedirects(): readonly HandbookRedirect[] {
  const track = `/:track(${TRACK_SEGMENT})`;
  return [
    { source: "/", destination: "/en", permanent: false },
    legacyRedirect("/instructions", "/en/instructions"),
    legacyRedirect("/other/system-design", "/en/system-design"),
    legacyRedirect("/other/special", "/en/other/computer-science"),
    legacyRedirect("/other/paradigms", "/en/other/computer-science"),
    legacyRedirect("/other/special-paradigms", "/en/other/computer-science"),
    legacyRedirect("/other/ai", "/en/ai"),
    legacyRedirect(
      "/:locale(en|ru)/other/special-sdlc",
      "/:locale/ai/special-sdlc",
    ),
    legacyRedirect("/other/special-sdlc", "/en/ai/special-sdlc"),
    legacyRedirect(
      "/:locale(en|ru)/other/special-sdlc-principles",
      "/:locale/ai/special-sdlc-principles",
    ),
    legacyRedirect(
      "/other/special-sdlc-principles",
      "/en/ai/special-sdlc-principles",
    ),
    legacyRedirect(
      "/:locale(en|ru)/other/special-sdlc-phases",
      "/:locale/ai/special-sdlc-phases",
    ),
    legacyRedirect("/other/special-sdlc-phases", "/en/ai/special-sdlc-phases"),
    legacyRedirect("/other/special-testing", "/en/testing"),
    legacyRedirect(
      "/:locale(en|ru)/other/special-security",
      "/:locale/frontend/special-security",
    ),
    legacyRedirect("/other/special-security", "/en/frontend/special-security"),
    legacyRedirect(
      "/:locale(en|ru)/other/web-security-questions",
      "/:locale/frontend/web-security-questions",
    ),
    legacyRedirect(
      "/other/web-security-questions",
      "/en/frontend/web-security-questions",
    ),
    legacyRedirect(
      "/data-structures/data-structures-choosing",
      "/en/data-structures#choosing-a-data-structure",
    ),
    legacyRedirect(
      "/data-structures/data-structures-overview",
      "/en/data-structures#choosing-a-data-structure",
    ),
    legacyRedirect("/solid", "/en/system-design/solid"),
    legacyRedirect("/other/special-engineering", "/en/system-design/solid"),
    legacyRedirect(
      "/other/special-architecture",
      "/en/system-design/special-architecture",
    ),
    legacyRedirect("/other/git-fundamentals", "/en/other/git-core"),
    legacyRedirect("/frontend/css-fundamentals", "/en/frontend/css-core"),
    legacyRedirect(
      "/:locale(en|ru)/frontend/react-native",
      "/:locale/frontend/react-native-interview",
    ),
    legacyRedirect(
      "/frontend/react-native",
      "/en/frontend/react-native-interview",
    ),
    legacyRedirect(
      "/:locale(en|ru)/backend/go",
      "/:locale/backend/go-interview",
    ),
    legacyRedirect("/backend/go", "/en/backend/go-interview"),
    legacyRedirect(
      "/:locale(en|ru)/backend/scala",
      "/:locale/backend/scala-interview",
    ),
    legacyRedirect("/backend/scala", "/en/backend/scala-interview"),
    legacyRedirect(
      "/:locale(en|ru)/backend/redis",
      "/:locale/backend/redis-interview",
    ),
    legacyRedirect("/backend/redis", "/en/backend/redis-interview"),
    legacyRedirect(
      "/system-design/sd-foundations",
      "/en/system-design/sd-core",
    ),
    legacyRedirect(
      "/system-design/sd-patterns",
      "/en/system-design/special-patterns",
    ),
    legacyRedirect("/backend/nodejs-runtime", "/en/backend/nodejs-core"),
    legacyRedirect("/backend/nodejs-process", "/en/backend/nodejs-additional"),
    legacyRedirect(
      "/:locale(en|ru)/frontend/typescript-interview",
      "/:locale/frontend/ts-interview",
    ),
    legacyRedirect(
      "/frontend/typescript-interview",
      "/en/frontend/ts-interview",
    ),
    legacyRedirect(
      "/:locale(en|ru)/frontend/ts-freshers-guide",
      "/:locale/frontend/ts-basics#interview-practice-gfe-freshers",
    ),
    legacyRedirect(
      "/:locale(en|ru)/frontend/ts-freshers-guide-interview",
      "/:locale/frontend/ts-basics#interview-practice-gfe-freshers",
    ),
    legacyRedirect(
      "/:locale(en|ru)/frontend/typescript/ts-:topic",
      "/:locale/frontend/ts-:topic",
    ),
    legacyRedirect(
      "/frontend/typescript/ts-interview-tasks",
      "/en/frontend/ts-interview-tasks",
    ),
    legacyRedirect(track, "/en/:track"),
    legacyRedirect(`${track}/:topic`, "/en/:track/:topic"),
  ];
}
