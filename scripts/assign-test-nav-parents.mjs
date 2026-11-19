/**
 * Assign navParentSlug for Test track topics per prompts/prompt-test-reorganize-sections.md
 * Run: node scripts/assign-test-nav-parents.mjs --write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "lib/catalog/index.ts");
const CONTENT_EN = path.join(ROOT, "..", "mc-content", "en");
const CONTENT_RU = path.join(ROOT, "..", "mc-content", "ru");

export const TEST_ROOT_CHILDREN = new Set([
  "test-track-inventory",
  "test-track-combination-plan",
  "test-gfe-javascript",
  "test-gfe-react",
  "test-gfe-redux",
  "test-gfe-angular",
  "test-gfe-web",
  "test-section-typescript",
  "test-section-nextjs",
  "test-section-vue",
  "test-section-nodejs",
  "test-section-graphql",
  "test-section-rest-api",
  "test-section-qa-testing",
  "test-section-performance",
  "test-section-accessibility",
  "test-section-tooling",
  "test-section-machine-coding",
  "test-section-interview-process",
  "test-section-career-job-search",
  "test-section-career-salary",
  "test-section-career-learning",
  "test-section-career-market",
  "test-section-company-prep",
  "test-section-general-tech",
  "test-section-general",
]);

const COMPANY_PREP = new Set([
  "test-netflix-react-interview-questions",
  "test-paypal-frontend-interview-questions",
  "test-discord-frontend-interview-questions",
  "test-databricks-frontend-interview-questions",
  "test-rippling-frontend-interview-questions",
  "test-snowflake-frontend-interview-questions",
]);

const INTERVIEW_PROCESS = new Set([
  "test-frontend-mock-interview",
  "test-frontend-pair-programming-interview",
  "test-how-to-think-out-loud-in-a-frontend-coding-interview",
  "test-how-to-explain-your-projects-in-a-frontend-interview",
  "test-how-frontend-interviews-are-scored",
  "test-frontend-take-home-assignment",
  "test-ai-coding-interviews",
  "test-frontend-interview-process-at-google-amazon-and-meta-what-to-expect",
]);

const CAREER_SALARY = new Set([
  "test-faang-frontend-developer-compensation-what-to-expect-at-each-level",
  "test-faang-frontend-developer-salary-india",
  "test-front-end-jobs-with-good-salary-in-india-where-to-target",
  "test-frontend-developer-salary-in-bangalore",
  "test-frontend-developer-salary-in-hyderabad",
  "test-frontend-developer-salary-india",
  "test-frontend-developer-salary-negotiation",
  "test-how-to-evaluate-tech-job-offer-india",
]);

const CAREER_LEARNING = new Set([
  "test-best-resources-to-learn-frontend-development",
  "test-frontend-developer-roadmap",
  "test-how-to-learn-javascript",
  "test-how-to-learn-react",
  "test-how-to-learn-typescript",
  "test-how-long-does-it-take-to-become-a-frontend-developer",
  "test-frontend-development-for-beginners",
  "test-how-to-become-a-frontend-developer",
]);

const CAREER_MARKET = new Set([
  "test-best-big-companies-for-front-end-career",
  "test-best-medium-companies-for-front-end-career",
  "test-evaluating-companies-as-front-end-engineer",
  "test-frontend-developer-demand-a-job-market-reality-check",
  "test-how-to-grow-as-a-frontend-developer",
  "test-is-frontend-development-a-good-career",
  "test-is-frontend-development-dying-2026",
  "test-startup-vs-faang-for-frontend-developers",
]);

const REACT_SLUGS = new Set([
  "test-react-top-30",
  "test-react-30-basic-advanced",
  "test-react-50-essential",
  "test-react-30-hooks",
  "test-react-100-ex",
  "test-react-50-coding",
  "test-react-experienced-50",
  "test-micro-frontends",
  "test-code-splitting-and-lazy-loading-in-react",
  "test-leveraging-actions-in-react-19-for-enhance-form-handling",
  "test-most-useful-and-impactful-react-ecosystem-libraries",
  "test-top-headless-ui-libraries-for-react-in-2026",
  "test-top-react-ui-component-libraries-in-2024",
  "test-typescript-for-react-developers",
]);

const MACHINE_CODING_SLUGS = new Set([
  "test-machine-coding-3yoe",
  "test-machine-coding-freshers",
  "test-machine-coding-leads",
  "test-machine-coding-round",
  "test-frontend-lld-react-machine-coding-questions",
]);

/** @param {{ slug: string, file: string, title: string }} topic */
export function assignTestNavParent({ slug, file, title }) {
  if (slug === "test") {
    return undefined;
  }
  if (TEST_ROOT_CHILDREN.has(slug)) {
    return "test";
  }

  const s = slug.toLowerCase();
  const f = file.toLowerCase();
  const hay = `${s} ${f} ${title.toLowerCase()}`;

  if (REACT_SLUGS.has(slug)) {
    return "test-gfe-react";
  }
  if (MACHINE_CODING_SLUGS.has(slug)) {
    return "test-section-machine-coding";
  }
  if (COMPANY_PREP.has(slug)) {
    return "test-section-company-prep";
  }
  if (INTERVIEW_PROCESS.has(slug)) {
    return "test-section-interview-process";
  }
  if (CAREER_SALARY.has(slug)) {
    return "test-section-career-salary";
  }
  if (CAREER_LEARNING.has(slug)) {
    return "test-section-career-learning";
  }
  if (CAREER_MARKET.has(slug)) {
    return "test-section-career-market";
  }

  if (slug === "test-react-vs-angular-vs-vue") {
    return "test-section-general";
  }

  if (/\bredux\b/.test(hay)) {
    return "test-gfe-redux";
  }
  if (/\bangular\b/.test(hay) && slug !== "test-react-vs-angular-vs-vue") {
    return "test-gfe-angular";
  }
  if (/\bvue\b/.test(hay)) {
    return "test-section-vue";
  }
  if (/\bgraphql\b/.test(hay)) {
    return "test-section-graphql";
  }
  if (/\bnext[\s_-]?js\b|\bnext-/.test(hay)) {
    return "test-section-nextjs";
  }
  if (/\bnodejs\b|\bnode-js\b|\bnode_js\b|\bnode\.js\b/.test(hay)) {
    return "test-section-nodejs";
  }
  if (/\brest[\s_-]?api\b/.test(hay)) {
    return "test-section-rest-api";
  }
  if (/\bfrontend-testing\b|\btesting-senior\b|_frontend_testing_/.test(hay)) {
    return "test-section-qa-testing";
  }
  if (
    /\ba11y\b|\baccessibility-interview\b|_a11y_/.test(hay) ||
    slug === "test-a11y-senior"
  ) {
    return "test-section-accessibility";
  }
  if (
    /\bweb-perf\b|\bweb_perf\b|\bweb-performance\b|front-end-performance|front_end_performance|image-performance|image_performance|core-web-vitals|core_web_vitals/.test(
      hay,
    )
  ) {
    return "test-section-performance";
  }
  if (
    /\bnpm-|\bbuild-tools\b|_npm_|_build_tools_|git-interview|_git_/.test(hay)
  ) {
    return "test-section-tooling";
  }
  if (
    (/\btypescript\b/.test(hay) ||
      /\bts-/.test(s) ||
      /_ts_/.test(f) ||
      slug.startsWith("test-ts-")) &&
    !/for-react/.test(hay)
  ) {
    return "test-section-typescript";
  }
  if (
    /\bhtml[\s_-]|\bcss[\s_-]|html-css|web-apps-at-scale|browser-fundamentals|top-css-mistakes|senior-browser/.test(
      hay,
    ) &&
    !/\bjavascript-interview\b/.test(s)
  ) {
    return "test-gfe-web";
  }
  if (
    (/\bjavascript\b/.test(hay) ||
      /\bjs-/.test(s) ||
      /_js_/.test(f) ||
      slug.startsWith("test-js-")) &&
    !/\bhtml-css\b/.test(s)
  ) {
    return "test-gfe-javascript";
  }
  if (/\breact\b/.test(hay)) {
    return "test-gfe-react";
  }
  if (
    /\bds-senior\b|\bweb-security\b|\bdebugging\b|code-review-interview|_ds_senior_/.test(
      hay,
    ) ||
    slug === "test-ds-senior" ||
    slug === "test-frontend-web-security-interview-questions" ||
    slug === "test-frontend-debugging-interview-questions" ||
    slug === "test-code-review-interview-for-frontend-developers"
  ) {
    return "test-section-general-tech";
  }
  if (/\bsalary\b|\bcompensation\b|\bnegotiation\b/.test(hay)) {
    return "test-section-career-salary";
  }
  if (
    /\bhow-to-learn\b|\broadmap\b|resources-to-learn|become-a-frontend|become_a_frontend|for-beginners|for_beginners/.test(
      hay,
    )
  ) {
    return "test-section-career-learning";
  }
  if (
    /\bresume\b|\bcover-letter\b|\bportfolio\b|\blinkedin\b|\bgithub-profile\b|\bjobs-for-freshers\b|\bjobs-in-\b|\bremote-.*jobs\b|\bproject-ideas\b|\bcareer-path\b|\binternship\b|\bfaang\b.*job|\bjob-at-faang\b|\bswitch-from\b|\bfreelance\b|\btips-freshers\b|\bvs-backend\b|\bvs-fullstack\b|\bto-tech-lead\b|\bto-engineering-manager\b|\bto-full-stack\b|\bto-product-manager\b|\bto-ai-engineer\b|\bstaff-engineer\b|\barchitect\b|\bno-experience\b|\bwrite-.*resume\b|\bside-project\b/.test(
      hay,
    )
  ) {
    return "test-section-career-job-search";
  }
  if (
    /\bdemand\b|\bdying\b|\bgood-career\b|\bstartup-vs\b|\bevaluating-companies\b|\bbest-big\b|\bbest-medium\b|\bgrow-as\b|\bjordan-cutler\b/.test(
      hay,
    )
  ) {
    return "test-section-career-market";
  }
  if (
    /\bmock-interview\b|\bpair-programming\b|\bthink-out-loud\b|\bexplain-your-projects\b|\binterviews-are-scored\b|\btake-home\b|\bai-coding\b|\binterview-process-at-google\b/.test(
      hay,
    )
  ) {
    return "test-section-interview-process";
  }

  return "test-section-general";
}

function parseTestTopics(source) {
  const topics = [];
  const chunks = source.split("\n  },\n");
  for (const chunk of chunks) {
    if (!chunk.includes('track: "test"')) {
      continue;
    }
    const slug = chunk.match(/slug: "([^"]+)"/)?.[1];
    const file = chunk.match(/file: "([^"]+)"/)?.[1];
    if (!slug || !file) {
      continue;
    }
    const titleMatch = chunk.match(
      /title:\s*("(?:[^"\\]|\\.)*"|[\s\S]*?),[\s\n]*\s*blurb:/,
    );
    let title = titleMatch?.[1] ?? slug;
    title = title.trim();
    if (title.startsWith('"')) {
      title = title.slice(1, title.lastIndexOf('"'));
    }
    const navMatch = chunk.match(/navParentSlug: "([^"]+)"/);
    topics.push({
      slug,
      file,
      title,
      navParentSlug: navMatch?.[1],
    });
  }
  return topics;
}

function patchCatalog(source, assignments) {
  let out = source;
  for (const { slug, parent } of assignments) {
    if (parent === undefined) {
      continue;
    }
    const slugIdx = out.indexOf(`slug: "${slug}"`);
    if (slugIdx === -1) {
      throw new Error(`slug not found: ${slug}`);
    }
    const trackIdx = out.indexOf('track: "test"', slugIdx);
    const closeIdx = out.indexOf("\n  },", trackIdx);
    const block = out.slice(slugIdx, closeIdx);
    if (!block.includes("navParentSlug:")) {
      const insertAt = block.lastIndexOf("hideFromSubjectNav: true");
      if (insertAt === -1) {
        throw new Error(`no hideFromSubjectNav for ${slug}`);
      }
      const absInsert = slugIdx + insertAt + "hideFromSubjectNav: true".length;
      out =
        out.slice(0, absInsert) +
        `,\n    navParentSlug: "${parent}"` +
        out.slice(absInsert);
    } else {
      const navRe = new RegExp(
        `(slug: "${slug}"[\\s\\S]*?navParentSlug: )"[^"]+"`,
      );
      out = out.replace(navRe, `$1"${parent}"`);
    }
  }
  return out;
}

function seniorityRank(title) {
  const t = title.toLowerCase();
  if (
    /fresher|beginner|junior|for freshers|0\s*experience|no experience/.test(t)
  ) {
    return 0;
  }
  if (/2 years|3 years|mid|experienced|basic/.test(t)) {
    return 1;
  }
  if (/senior|10\+|10 yoe|principal|lead|staff|advanced/.test(t)) {
    return 2;
  }
  if (
    /essay|guide|roadmap|career|salary|jobs|portfolio|resume|how to/.test(t)
  ) {
    return 3;
  }
  return 1;
}

function hubTableRows(children) {
  const sorted = [...children].sort((a, b) => {
    const dr = seniorityRank(a.title) - seniorityRank(b.title);
    if (dr !== 0) {
      return dr;
    }
    return a.title.localeCompare(b.title);
  });
  return sorted
    .map((c) => {
      const short = c.title.length > 56 ? `${c.title.slice(0, 53)}…` : c.title;
      return `| [${short}](/en/test/${c.slug}) | listicle |`;
    })
    .join("\n");
}

function writeHubIndex(locale, hubSlug, hubTitle, intro, children) {
  const dir = locale === "en" ? CONTENT_EN : CONTENT_RU;
  const hub = children.find((c) => c.slug === hubSlug);
  if (!hub) {
    return;
  }
  const filePath = path.join(dir, hub.file);
  const back =
    locale === "en" ? `[← Test](/en/test/test)` : `[← Тест](/ru/test/test)`;
  const sectionLabel = locale === "en" ? "Articles" : "Статьи";
  const col1 = locale === "en" ? "Test page" : "Страница";
  const col2 = locale === "en" ? "Notes" : "Заметки";
  const prefix = locale === "en" ? "/en/test" : "/ru/test";
  const rows = [...children]
    .filter((c) => c.slug !== hubSlug)
    .sort((a, b) => {
      const dr = seniorityRank(a.title) - seniorityRank(b.title);
      if (dr !== 0) {
        return dr;
      }
      return a.title.localeCompare(b.title);
    })
    .map((c) => {
      const short = c.title.length > 52 ? `${c.title.slice(0, 49)}…` : c.title;
      const note = /interview|questions|coding/i.test(c.title)
        ? "Q&A"
        : "essay";
      const href = `${prefix}/${c.slug}`;
      return `| [${short}](${href}) | ${note} |`;
    })
    .join("\n");

  const body = `# ${hubTitle}

${intro}

${back}

### Sections

- [${sectionLabel}](#articles)

---

## ${sectionLabel}

| ${col1} | ${col2} |
| ------- | ------ |
${rows}
`;
  fs.writeFileSync(filePath, body);
}

const NEW_HUBS = [
  {
    slug: "test-section-typescript",
    file: "0_test_section_typescript.md",
    title: "TypeScript",
    blurb: "TypeScript interview listicles (Test sandbox).",
    introEn: "TypeScript interview Q&A and guides — **Test** sandbox.",
    introRu: "TypeScript: вопросы для собеседований — песочница **Test**.",
    titleRu: "TypeScript",
  },
  {
    slug: "test-section-nextjs",
    file: "0_test_section_nextjs.md",
    title: "Next.js",
    blurb: "Next.js interview listicles (Test sandbox).",
    introEn: "Next.js interview Q&A — **Test** sandbox.",
    introRu: "Next.js: вопросы для собеседований — песочница **Test**.",
    titleRu: "Next.js",
  },
  {
    slug: "test-section-vue",
    file: "0_test_section_vue.md",
    title: "Vue",
    blurb: "Vue.js interview listicles (Test sandbox).",
    introEn: "Vue.js interview Q&A — **Test** sandbox.",
    introRu: "Vue.js: вопросы для собеседований — песочница **Test**.",
    titleRu: "Vue",
  },
  {
    slug: "test-section-nodejs",
    file: "0_test_section_nodejs.md",
    title: "Node.js",
    blurb: "Node.js interview listicles (Test sandbox).",
    introEn: "Node.js interview Q&A — **Test** sandbox.",
    introRu: "Node.js: вопросы для собеседований — песочница **Test**.",
    titleRu: "Node.js",
  },
  {
    slug: "test-section-graphql",
    file: "0_test_section_graphql.md",
    title: "GraphQL",
    blurb: "GraphQL interview listicles (Test sandbox).",
    introEn: "GraphQL interview Q&A — **Test** sandbox.",
    introRu: "GraphQL: вопросы для собеседований — песочница **Test**.",
    titleRu: "GraphQL",
  },
  {
    slug: "test-section-rest-api",
    file: "0_test_section_rest_api.md",
    title: "REST & APIs",
    blurb: "REST and API interview listicles (Test sandbox).",
    introEn: "REST and HTTP API interview Q&A — **Test** sandbox.",
    introRu: "REST и API: вопросы для собеседований — песочница **Test**.",
    titleRu: "REST и API",
  },
  {
    slug: "test-section-qa-testing",
    file: "0_test_section_qa_testing.md",
    title: "Testing (QA)",
    blurb: "Frontend testing interview listicles (Test sandbox).",
    introEn: "Jest, RTL, and QA interview Q&A — **Test** sandbox.",
    introRu: "Тестирование фронтенда: Q&A — песочница **Test**.",
    titleRu: "Тестирование (QA)",
  },
  {
    slug: "test-section-performance",
    file: "0_test_section_performance.md",
    title: "Performance",
    blurb: "Web performance interview listicles (Test sandbox).",
    introEn: "Web performance and CWV interview Q&A — **Test** sandbox.",
    introRu: "Производительность веба: Q&A — песочница **Test**.",
    titleRu: "Производительность",
  },
  {
    slug: "test-section-accessibility",
    file: "0_test_section_accessibility.md",
    title: "Accessibility",
    blurb: "Accessibility (a11y) interview listicles (Test sandbox).",
    introEn: "Accessibility interview Q&A — **Test** sandbox.",
    introRu: "Доступность (a11y): Q&A — песочница **Test**.",
    titleRu: "Доступность",
  },
  {
    slug: "test-section-tooling",
    file: "0_test_section_tooling.md",
    title: "Tooling",
    blurb: "npm, Git, and build-tool interview listicles (Test sandbox).",
    introEn: "npm, Git, and bundler interview Q&A — **Test** sandbox.",
    introRu: "Инструменты (npm, Git, сборка): Q&A — песочница **Test**.",
    titleRu: "Инструменты",
  },
  {
    slug: "test-section-machine-coding",
    file: "0_test_section_machine_coding.md",
    title: "Machine coding",
    blurb: "Machine coding and LLD listicles (Test sandbox).",
    introEn: "Machine coding rounds and frontend LLD — **Test** sandbox.",
    introRu: "Machine coding и LLD — песочница **Test**.",
    titleRu: "Machine coding",
  },
  {
    slug: "test-section-interview-process",
    file: "0_test_section_interview_process.md",
    title: "Interview process",
    blurb: "Mock interviews, scoring, and take-homes (Test sandbox).",
    introEn: "How frontend interviews run: mocks, pairing, take-homes.",
    introRu: "Процесс собеседований: моки, парное программирование, take-home.",
    titleRu: "Процесс собеседований",
  },
  {
    slug: "test-section-career-job-search",
    file: "0_test_section_career_job_search.md",
    title: "Career: job search",
    blurb: "Resume, portfolio, jobs by city, and role switches (Test).",
    introEn: "Job search, resumes, portfolios, and city guides — **Test**.",
    introRu: "Поиск работы, резюме, портфолио — песочница **Test**.",
    titleRu: "Карьера: поиск работы",
  },
  {
    slug: "test-section-career-salary",
    file: "0_test_section_career_salary.md",
    title: "Career: salary & offers",
    blurb: "Salary, compensation, and offer evaluation (Test sandbox).",
    introEn: "Salaries, negotiation, and evaluating offers — **Test**.",
    introRu: "Зарплаты, переговоры и офферы — песочница **Test**.",
    titleRu: "Карьера: зарплата и офферы",
  },
  {
    slug: "test-section-career-learning",
    file: "0_test_section_career_learning.md",
    title: "Career: learning paths",
    blurb: "Roadmaps and how-to-learn guides (Test sandbox).",
    introEn: "Learning paths and beginner roadmaps — **Test**.",
    introRu: "Пути обучения и роадмапы — песочница **Test**.",
    titleRu: "Карьера: обучение",
  },
  {
    slug: "test-section-career-market",
    file: "0_test_section_career_market.md",
    title: "Career: market & companies",
    blurb: "Demand, FAANG vs startup, company picks (Test sandbox).",
    introEn: "Job market and company evaluation — **Test** sandbox.",
    introRu: "Рынок труда и выбор компании — песочница **Test**.",
    titleRu: "Карьера: рынок и компании",
  },
  {
    slug: "test-section-company-prep",
    file: "0_test_section_company_prep.md",
    title: "Company interview prep",
    blurb: "Company-specific frontend interview guides (Test).",
    introEn: "Netflix, PayPal, and other company prep pages — **Test**.",
    introRu: "Подготовка к собеседованиям в конкретных компаниях — **Test**.",
    titleRu: "Подготовка по компаниям",
  },
  {
    slug: "test-section-general-tech",
    file: "0_test_section_general_tech.md",
    title: "General tech Q&A",
    blurb: "DSA, security, debugging, and code review (Test sandbox).",
    introEn: "Cross-cutting technical interview Q&A — **Test**.",
    introRu: "Общие технические Q&A — песочница **Test**.",
    titleRu: "Общие технические Q&A",
  },
  {
    slug: "test-section-general",
    file: "0_test_section_general.md",
    title: "General / essays",
    blurb: "Misc essays, roundups, and quizzes (Test sandbox).",
    introEn: "Essays, roundups, and misc drafts — **Test** sandbox.",
    introRu: "Эссе, подборки и прочее — песочница **Test**.",
    titleRu: "Общее / эссе",
  },
];

function insertNewHubs(source) {
  if (source.includes('slug: "test-section-typescript"')) {
    return source;
  }
  const anchor = `  {
    slug: "test-gfe-web",`;
  const insert = NEW_HUBS.map(
    (h) => `  {
    slug: "${h.slug}",
    file: "${h.file}",
    title: "${h.title}",
    blurb: "${h.blurb}",
    track: "test",
    hideFromSubjectNav: true,
    navParentSlug: "test",
  },`,
  ).join("\n");
  return source.replace(anchor, `${insert}\n${anchor}`);
}

const write = process.argv.includes("--write");
const refreshHubsOnly = process.argv.includes("--refresh-hubs");

const source = fs.readFileSync(CATALOG, "utf8");
const topics = parseTestTopics(source);
const assignments = topics.map((t) => ({
  slug: t.slug,
  parent: assignTestNavParent(t),
  file: t.file,
  title: t.title,
}));

const changes = assignments.filter((a, i) => {
  const cur = topics[i].navParentSlug;
  return a.parent && cur !== a.parent;
});

console.log(`topics: ${topics.length}, changes: ${changes.length}`);
const illegal = assignments.filter(
  (a) => a.parent === "test" && !TEST_ROOT_CHILDREN.has(a.slug),
);
if (illegal.length) {
  console.error("Illegal direct test children:", illegal);
  process.exit(1);
}

if (!write && !refreshHubsOnly) {
  changes.slice(0, 20).forEach((c) => console.log(`${c.slug}: -> ${c.parent}`));
  console.log("Dry run. Pass --write to apply.");
  process.exit(0);
}

if (write) {
  let patched = patchCatalog(source, assignments);
  patched = insertNewHubs(patched);
  fs.writeFileSync(CATALOG, patched);
}

const byParent = new Map();
for (const a of assignments) {
  if (!a.parent || a.parent === "test") {
    continue;
  }
  if (!byParent.has(a.parent)) {
    byParent.set(a.parent, []);
  }
  byParent.get(a.parent).push(a);
}

const hubMeta = new Map(
  [
    ...NEW_HUBS,
    {
      slug: "test-gfe-javascript",
      title: "JavaScript",
      introEn:
        "GreatFrontEnd JavaScript interview listicles — **Test** sandbox.",
      titleRu: "JavaScript",
      introRu: "JavaScript: Q&A — песочница **Test**.",
    },
    {
      slug: "test-gfe-react",
      title: "React",
      introEn:
        "GreatFrontEnd React, hooks, and ecosystem listicles — **Test** sandbox.",
      titleRu: "React",
      introRu: "React: Q&A — песочница **Test**.",
    },
    {
      slug: "test-gfe-redux",
      title: "Redux",
      introEn: "Redux interview listicles — **Test** sandbox.",
      titleRu: "Redux",
      introRu: "Redux: Q&A — песочница **Test**.",
    },
    {
      slug: "test-gfe-angular",
      title: "Angular",
      introEn: "Angular interview listicles — **Test** sandbox.",
      titleRu: "Angular",
      introRu: "Angular: Q&A — песочница **Test**.",
    },
    {
      slug: "test-gfe-web",
      title: "HTML, CSS & JavaScript",
      introEn: "HTML, CSS, and web-fundamentals listicles — **Test** sandbox.",
      titleRu: "HTML, CSS и JavaScript",
      introRu: "HTML, CSS и веб-основы — песочница **Test**.",
    },
    ...NEW_HUBS,
  ].map((h) => [h.slug, h]),
);

for (const [hubSlug, meta] of hubMeta) {
  const kids = byParent.get(hubSlug) ?? [];
  const hubTopic = topics.find((t) => t.slug === hubSlug) ?? {
    slug: hubSlug,
    file: NEW_HUBS.find((h) => h.slug === hubSlug)?.file ?? "",
  };
  const children = [
    { slug: hubSlug, file: hubTopic.file, title: meta.title },
    ...kids,
  ];
  writeHubIndex("en", hubSlug, meta.title, meta.introEn, children);
  writeHubIndex("ru", hubSlug, meta.titleRu, meta.introRu, children);
}

console.log("Catalog and hub indexes updated.");
