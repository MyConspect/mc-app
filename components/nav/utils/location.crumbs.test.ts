import assert from "node:assert/strict";
import test from "node:test";
import type { NavGroup } from "@/lib/nav";
import {
  adjacentConceptId,
  crumbsForPath,
  navChainForPath,
  navChainIndex,
  parentHrefForPath,
  siblingNavHrefForPath,
} from "./location";

const labels = { home: "Home", instructions: "Instructions" };

const groups: readonly NavGroup[] = [
  {
    id: "backend",
    title: "Backend",
    href: "/backend",
    entries: [
      {
        kind: "subject",
        subject: {
          slug: "nodejs",
          href: "/backend/nodejs",
          title: "Node.js",
          blurb: "",
          clusters: [
            {
              id: "core",
              title: "Core",
              href: "/backend/nodejs#core",
              topics: [
                {
                  slug: "nodejs-core",
                  href: "/backend/nodejs-core",
                  title: "Core",
                  blurb: "",
                  concepts: [],
                },
              ],
            },
            {
              id: "http",
              title: "HTTP",
              href: "/backend/nodejs#http",
              topics: [
                {
                  slug: "nodejs-http",
                  href: "/backend/nodejs-http",
                  title: "HTTP",
                  blurb: "",
                  concepts: [{ id: "express", title: "Express" }],
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    href: "/frontend",
    entries: [
      {
        kind: "subject",
        subject: {
          slug: "html",
          href: "/frontend/html",
          title: "HTML",
          blurb: "",
          clusters: [
            {
              id: "core",
              title: "Core",
              href: "/frontend/html#core",
              topics: [
                {
                  slug: "html-structure",
                  href: "/frontend/html-structure",
                  title: "Structure",
                  blurb: "",
                  concepts: [],
                },
                {
                  slug: "html-forms",
                  href: "/frontend/html-forms",
                  title: "Forms",
                  blurb: "",
                  concepts: [],
                },
              ],
            },
          ],
        },
      },
      {
        kind: "subject",
        subject: {
          slug: "javascript",
          href: "/frontend/javascript",
          title: "JavaScript",
          blurb: "",
          clusters: [
            {
              id: "async",
              title: "Async",
              href: "/frontend/javascript#async",
              topics: [
                {
                  slug: "js-async-promises",
                  href: "/frontend/js-async-promises",
                  title: "Promises",
                  blurb: "",
                  concepts: [],
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

const leafTrackGroup: NavGroup = {
  id: "behavior",
  title: "Behavior questions",
  href: "/behavior",
  entries: [],
  leafTopic: {
    slug: "behavior-questions",
    href: "/behavior",
    title: "Behavior questions",
    blurb: "",
    concepts: [
      { id: "prep", title: "Interview preparation" },
      { id: "tell-me", title: "Tell me about yourself" },
    ],
  },
};

function trail(pathname: string, hash = "") {
  return crumbsForPath(groups, pathname, hash, labels).map(
    (item) => item.label,
  );
}

test("Node.js hub does not treat a same-named cluster hash as the current page", () => {
  assert.deepEqual(trail("/backend/nodejs", "#http"), [
    "Home",
    "Backend",
    "Node.js",
  ]);
});

test("subject index includes open concept in breadcrumbs", () => {
  const subjectGroups: readonly NavGroup[] = [
    {
      id: "frontend",
      title: "Frontend",
      href: "/frontend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "core",
            href: "/frontend/core",
            title: "Core",
            blurb: "",
            clusters: [
              {
                id: "platform",
                title: "Platform",
                href: "/frontend/core#platform",
                topics: [
                  {
                    slug: "core-browser-platform",
                    href: "/frontend/core-browser-platform",
                    title: "Browser platform",
                    blurb: "",
                    concepts: [
                      {
                        id: "navigation-and-fetching",
                        title: "Navigation and fetching",
                        group: "Browser work principles",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];
  assert.deepEqual(
    crumbsForPath(
      subjectGroups,
      "/frontend/core",
      "#navigation-and-fetching",
      labels,
    ).map((item) => item.label),
    [
      "Home",
      "Frontend",
      "Core",
      "Browser work principles",
      "Navigation and fetching",
    ],
  );
  const groupCrumb = crumbsForPath(
    subjectGroups,
    "/frontend/core",
    "#navigation-and-fetching",
    labels,
  )[3];
  assert.equal(
    groupCrumb?.sectionScrollId,
    "concept-group-browser-work-principles",
  );
  assert.equal(groupCrumb?.href, undefined);
});

test("subject index repeats group label when overview concept shares the group title", () => {
  const subjectGroups: readonly NavGroup[] = [
    {
      id: "frontend",
      title: "Frontend",
      href: "/frontend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "core",
            href: "/frontend/core",
            title: "Core",
            blurb: "",
            clusters: [
              {
                id: "platform",
                title: "Platform",
                href: "/frontend/core#platform",
                topics: [
                  {
                    slug: "core-browser-platform",
                    href: "/frontend/core-browser-platform",
                    title: "Browser platform",
                    blurb: "",
                    concepts: [
                      {
                        id: "browser-work-principles",
                        title: "Browser work principles",
                        group: "Browser work principles",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];
  assert.deepEqual(
    crumbsForPath(
      subjectGroups,
      "/frontend/core",
      "#browser-work-principles",
      labels,
    ).map((item) => item.label),
    [
      "Home",
      "Frontend",
      "Core",
      "Browser work principles",
      "Browser work principles",
    ],
  );
});

test("Core cluster hash on the hub does not nest under Core", () => {
  assert.deepEqual(trail("/backend/nodejs", "#core"), [
    "Home",
    "Backend",
    "Node.js",
  ]);
});

test("HTTP topic does not duplicate the cluster name in the trail", () => {
  assert.deepEqual(trail("/backend/nodejs-http"), [
    "Home",
    "Backend",
    "Node.js",
    "HTTP",
  ]);
});

test("Core topic does not duplicate the cluster name in the trail", () => {
  assert.deepEqual(trail("/backend/nodejs-core"), [
    "Home",
    "Backend",
    "Node.js",
    "Core",
  ]);
});

test("leaf track hub skips duplicate topic index in nav chain", () => {
  const chain = navChainForPath([leafTrackGroup], "/behavior", "");
  assert.deepEqual(
    chain?.map((step) =>
      step.hash ? `${step.pathname}#${step.hash}` : step.pathname,
    ),
    ["/behavior", "/behavior#prep", "/behavior#tell-me"],
  );
});

test("leaf track next from hub opens the first concept", () => {
  assert.equal(
    siblingNavHrefForPath([leafTrackGroup], "/behavior", "", 1),
    "/behavior#prep",
  );
});

test("leaf track next from last concept returns to the topic menu", () => {
  assert.equal(
    siblingNavHrefForPath([leafTrackGroup], "/behavior", "#tell-me", 1),
    "/behavior",
  );
});

test("navChainForPath scopes topic siblings within a cluster", () => {
  const chain = navChainForPath(groups, "/backend/nodejs-core", "");
  assert.ok(chain);
  assert.equal(chain?.[0]?.pathname, "/backend/nodejs-core");
  assert.equal(chain?.length, 1);
});

test("navChainForPath includes the cluster hub for multi-topic clusters", () => {
  const chain = navChainForPath(groups, "/frontend/html-structure", "");
  assert.ok(chain);
  assert.deepEqual(
    chain?.map((step) =>
      step.hash ? `${step.pathname}#${step.hash}` : step.pathname,
    ),
    ["/frontend/html#core", "/frontend/html-structure", "/frontend/html-forms"],
  );
});

test("siblingNavHrefForPath moves within the scoped cluster and wraps next at the end", () => {
  assert.equal(
    siblingNavHrefForPath(groups, "/backend/nodejs-core", "", -1),
    null,
  );
  assert.equal(
    siblingNavHrefForPath(groups, "/backend/nodejs-core", "", 1),
    null,
  );
  assert.equal(
    siblingNavHrefForPath(groups, "/backend/nodejs-http", "", -1),
    null,
  );
  assert.equal(
    siblingNavHrefForPath(groups, "/backend/nodejs-http", "", 1),
    null,
  );
  assert.equal(
    siblingNavHrefForPath(groups, "/frontend/html-structure", "", 1),
    "/frontend/html-forms",
  );
  assert.equal(
    siblingNavHrefForPath(groups, "/frontend/html-forms", "", 1),
    "/frontend/html#core",
  );
});

test("last concept in a topic returns to the topic list before leaving the cluster", () => {
  const databaseGroups: readonly NavGroup[] = [
    {
      id: "backend",
      title: "Backend",
      href: "/backend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "database",
            href: "/backend/database",
            title: "Database",
            blurb: "",
            clusters: [
              {
                id: "core",
                title: "Core",
                href: "/backend/database-foundations",
                topics: [
                  {
                    slug: "database-foundations",
                    href: "/backend/database-foundations",
                    title: "Core",
                    blurb: "",
                    concepts: [],
                  },
                ],
              },
              {
                id: "sql",
                title: "SQL",
                href: "/backend/database-sql",
                topics: [
                  {
                    slug: "database-sql",
                    href: "/backend/database-sql",
                    title: "SQL",
                    blurb: "",
                    concepts: [
                      { id: "indexes", title: "Indexes" },
                      { id: "postgres", title: "PostgreSQL" },
                    ],
                  },
                ],
              },
              {
                id: "nosql",
                title: "NoSQL",
                href: "/backend/database#nosql",
                topics: [
                  {
                    slug: "nosql-core",
                    href: "/backend/database-nosql-core",
                    title: "NoSQL Core",
                    blurb: "",
                    concepts: [
                      { id: "overview", title: "Overview" },
                      { id: "types", title: "Types" },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  assert.equal(
    siblingNavHrefForPath(
      databaseGroups,
      "/backend/database-sql",
      "#postgres",
      1,
    ),
    "/backend/database-sql",
  );
});

test("navChainIndex matches pathname and concept hash", () => {
  const chain = navChainForPath(groups, "/backend/nodejs-http", "#express");
  assert.ok(chain);
  assert.equal(
    navChainIndex(chain ?? [], "/backend/nodejs-http", "#express"),
    chain?.findIndex((step) => step.hash === "express"),
  );
});

test("siblingNavHrefForPath steps through concepts on the same topic only", () => {
  const frontendFunctions: readonly NavGroup[] = [
    {
      id: "frontend",
      title: "Frontend",
      href: "/frontend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "typescript",
            href: "/frontend/typescript",
            title: "TypeScript",
            blurb: "",
            clusters: [
              {
                id: "functions",
                title: "Functions",
                href: "/frontend/typescript#functions",
                topics: [
                  {
                    slug: "ts-functions",
                    href: "/frontend/ts-functions",
                    title: "Functions",
                    blurb: "",
                    concepts: [
                      { id: "call-signatures", title: "Call Signatures" },
                      { id: "generic-functions", title: "Generic Functions" },
                      { id: "inference", title: "Inference" },
                    ],
                  },
                  {
                    slug: "ts-objects",
                    href: "/frontend/ts-objects",
                    title: "Object Types",
                    blurb: "",
                    concepts: [{ id: "shapes", title: "Shapes" }],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  assert.equal(
    siblingNavHrefForPath(
      frontendFunctions,
      "/frontend/ts-functions",
      "#generic-functions",
      -1,
    ),
    "/frontend/ts-functions#call-signatures",
  );
  assert.equal(
    siblingNavHrefForPath(
      frontendFunctions,
      "/frontend/ts-functions",
      "#generic-functions",
      1,
    ),
    "/frontend/ts-functions#inference",
  );
  assert.equal(
    siblingNavHrefForPath(
      frontendFunctions,
      "/frontend/ts-functions",
      "#inference",
      1,
    ),
    "/frontend/ts-functions",
  );
});

test("adjacentConceptId returns the next and previous concept id", () => {
  const ids = ["alpha", "beta", "gamma"];
  assert.equal(adjacentConceptId(ids, "beta", 1), "gamma");
  assert.equal(adjacentConceptId(ids, "beta", -1), "alpha");
  assert.equal(adjacentConceptId(ids, "gamma", 1), null);
});

test("parentHrefForPath returns the nearest linked ancestor", () => {
  assert.equal(
    parentHrefForPath(groups, "/backend/nodejs-core", "", labels),
    "/backend/nodejs",
  );
  assert.equal(
    parentHrefForPath(groups, "/backend/nodejs-http", "", labels),
    "/backend/nodejs",
  );
});

test("Additional topic does not duplicate the cluster name in the trail", () => {
  const withAdditional: typeof groups = [
    {
      ...groups[0],
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "nodejs",
            href: "/backend/nodejs",
            title: "Node.js",
            blurb: "",
            clusters: [
              {
                id: "additional",
                title: "Additional",
                href: "/backend/nodejs#additional",
                topics: [
                  {
                    slug: "nodejs-additional",
                    href: "/backend/nodejs-additional",
                    title: "Additional",
                    blurb: "",
                    concepts: [{ id: "child-process", title: "child_process" }],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    ...groups.slice(1),
  ];
  const labels = { home: "Home", instructions: "Instructions" };
  const trailAdditional = (pathname: string, hash = "") =>
    crumbsForPath(withAdditional, pathname, hash, labels).map(
      (item) => item.label,
    );
  assert.deepEqual(trailAdditional("/backend/nodejs-additional"), [
    "Home",
    "Backend",
    "Node.js",
    "Additional",
  ]);
  assert.deepEqual(
    trailAdditional("/backend/nodejs-additional", "#child-process"),
    ["Home", "Backend", "Node.js", "Additional", "child_process"],
  );
});

test("HTTP topic still appends the open concept", () => {
  assert.deepEqual(trail("/backend/nodejs-http", "#express"), [
    "Home",
    "Backend",
    "Node.js",
    "HTTP",
    "Express",
  ]);
});

test("multi-topic clusters stay in the trail", () => {
  assert.deepEqual(trail("/frontend/html-structure"), [
    "Home",
    "Frontend",
    "HTML",
    "Core",
    "Structure",
  ]);
});

test("JavaScript Async does not nest under Additional", () => {
  assert.deepEqual(trail("/frontend/js-async-promises"), [
    "Home",
    "Frontend",
    "JavaScript",
    "Async",
    "Promises",
  ]);
});

test("isHomePath matches locale home routes only", async () => {
  const { isHomePath } = await import("./location");
  assert.equal(isHomePath("/en"), true);
  assert.equal(isHomePath("/ru"), true);
  assert.equal(isHomePath("/en/frontend"), false);
  assert.equal(isHomePath("/en/instructions"), false);
});

test("siblingNavHrefForPath walks flat appendix sections as one chain", () => {
  const flatSectionGroups: readonly NavGroup[] = [
    {
      id: "frontend",
      title: "Frontend",
      href: "/frontend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "typescript",
            href: "/frontend/typescript",
            title: "TypeScript",
            blurb: "",
            clusters: [
              {
                id: "modules",
                title: "Modules",
                href: "/frontend/typescript#modules",
                topics: [
                  {
                    slug: "ts-modules",
                    href: "/frontend/ts-modules",
                    title: "Modules",
                    blurb: "",
                    concepts: [{ id: "overview", title: "Overview" }],
                  },
                ],
              },
            ],
            sections: [
              {
                id: "utility-types",
                title: "Utility Types",
                flatNav: true,
                clusters: [
                  {
                    id: "utility-object",
                    title: "Object utilities",
                    href: "/frontend/typescript#utility-object",
                    topics: [
                      {
                        slug: "ts-utility-object",
                        href: "/frontend/ts-utility-object",
                        title: "Object utilities",
                        blurb: "",
                        concepts: [{ id: "partial", title: "Partial" }],
                      },
                    ],
                  },
                ],
              },
              {
                id: "reference",
                title: "Reference",
                flatNav: true,
                clusters: [
                  {
                    id: "cheat-sheets",
                    title: "Cheat Sheets",
                    href: "/frontend/typescript#cheat-sheets",
                    topics: [
                      {
                        slug: "ts-cheat-sheets",
                        href: "/frontend/ts-cheat-sheets",
                        title: "Cheat Sheets",
                        blurb: "",
                        concepts: [{ id: "cheats", title: "Cheat Sheets" }],
                      },
                    ],
                  },
                  {
                    id: "decorators",
                    title: "Decorators",
                    href: "/frontend/typescript#decorators",
                    topics: [
                      {
                        slug: "ts-decorators",
                        href: "/frontend/ts-decorators",
                        title: "Decorators",
                        blurb: "",
                        concepts: [{ id: "overview", title: "Overview" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  const cheatSheets = "/frontend/ts-cheat-sheets";
  const chain = navChainForPath(flatSectionGroups, cheatSheets, "");
  assert.ok(chain);
  assert.equal(chain?.length, 2);

  assert.equal(
    siblingNavHrefForPath(flatSectionGroups, cheatSheets, "", -1),
    "/frontend/ts-utility-object",
  );
  assert.equal(
    siblingNavHrefForPath(flatSectionGroups, cheatSheets, "", 1),
    "/frontend/ts-decorators",
  );
});

test("siblingNavHrefForPath steps through nested topics inside a cluster", () => {
  const nestedGroups: readonly NavGroup[] = [
    {
      id: "frontend",
      title: "Frontend",
      href: "/frontend",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "javascript",
            href: "/frontend/javascript",
            title: "JavaScript",
            blurb: "",
            clusters: [
              {
                id: "additional",
                title: "Additional",
                href: "/frontend/javascript#additional",
                topics: [
                  {
                    slug: "parent",
                    href: "/frontend/parent",
                    title: "Parent",
                    blurb: "",
                    concepts: [],
                    nestedTopics: [
                      {
                        slug: "child-a",
                        href: "/frontend/child-a",
                        title: "Child A",
                        blurb: "",
                        concepts: [],
                      },
                      {
                        slug: "child-b",
                        href: "/frontend/child-b",
                        title: "Child B",
                        blurb: "",
                        concepts: [],
                      },
                    ],
                  },
                  {
                    slug: "sibling",
                    href: "/frontend/sibling",
                    title: "Sibling",
                    blurb: "",
                    concepts: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  const chain = navChainForPath(nestedGroups, "/frontend/child-b", "");
  assert.deepEqual(chain, [
    { pathname: "/frontend/javascript", hash: "additional" },
    { pathname: "/frontend/parent", hash: "" },
    { pathname: "/frontend/child-a", hash: "" },
    { pathname: "/frontend/child-b", hash: "" },
    { pathname: "/frontend/sibling", hash: "" },
  ]);

  assert.equal(
    siblingNavHrefForPath(nestedGroups, "/frontend/child-b", "", -1),
    "/frontend/child-a",
  );
  assert.equal(
    siblingNavHrefForPath(nestedGroups, "/frontend/child-b", "", 1),
    "/frontend/sibling",
  );
  assert.equal(
    siblingNavHrefForPath(nestedGroups, "/frontend/parent", "", 1),
    "/frontend/child-a",
  );
});

test("flatNav subject omits cluster from breadcrumbs", () => {
  const aiSdlcGroups: readonly NavGroup[] = [
    {
      id: "ai",
      title: "AI",
      href: "/ai",
      entries: [
        {
          kind: "subject",
          subject: {
            slug: "sdlc",
            href: "/ai/sdlc",
            title: "SDLC",
            blurb: "",
            flatNav: true,
            clusters: [
              {
                id: "lifecycle",
                title: "Lifecycle",
                href: "/ai/sdlc#lifecycle",
                topics: [
                  {
                    slug: "special-sdlc-principles",
                    href: "/ai/special-sdlc-principles",
                    title: "Principles",
                    blurb: "",
                    concepts: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ];

  assert.deepEqual(
    crumbsForPath(aiSdlcGroups, "/ai/sdlc", "#lifecycle", labels).map(
      (item) => item.label,
    ),
    ["Home", "AI", "SDLC"],
  );
  assert.deepEqual(
    crumbsForPath(aiSdlcGroups, "/ai/special-sdlc-principles", "", labels).map(
      (item) => item.label,
    ),
    ["Home", "AI", "SDLC", "Principles"],
  );
});

test("bookmarkMatchesPage matches topic and concept bookmarks", async () => {
  const { bookmarkMatchesPage } = await import("@/lib/nav/bookmarks");
  const topic = "/en/backend/nodejs-core";

  assert.equal(bookmarkMatchesPage(topic, "", topic), true);
  assert.equal(
    bookmarkMatchesPage(topic, "event-loop", topic, "event-loop"),
    true,
  );
  assert.equal(
    bookmarkMatchesPage(topic, "global-object", `${topic}#event-loop`),
    false,
  );
  assert.equal(
    bookmarkMatchesPage(topic, "event-loop", `${topic}#event-loop`),
    true,
  );
});
