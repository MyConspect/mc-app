# MyConspect

Browse-only study handbook. Conspect markdown lives in `resources/en` and `resources/ru` (same basenames — see `.cursor/rules/locale-sync.mdc`) and is turned into static pages at build time. Edit notes in the separate **[mc-content](https://github.com/MyConspect/mc-content)** repo (or a local `resources/` tree). This app repo gitignores `resources/`; Vercel and CI shallow-clone mc-content at build time (`scripts/ensure-resources.ts`).

Live site: [https://myconspect.vercel.app](https://myconspect.vercel.app).

Useful study links: [roadmap.sh](https://roadmap.sh/), [StackBlitz](https://stackblitz.com/), [GitNation](https://portal.gitnation.org/). Extra intro notes from the old Core README are in `resources/en/0_intro.md`.

## Routes

- `/` → redirects to `/en`
- `/en`, `/ru` — tracks (Frontend, Backend, Other, System design, Algorithms, AI)
- `/en/frontend` — topic cards
- `/en/frontend/html` — HTML subject hub (Core / Browser / Additional cards)
- `/en/frontend/html-structure` — one accordion page (`<details>` / `<summary>`)
- Language switcher keeps the same path under the other locale

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## E2E (sidebar)

Cypress checks real sidebar clicks (cluster open/close, hash, scroll). Production server on port 3456:

```bash
npm run build
npm run test:e2e
```

Interactive:

```bash
npm run build
npm run start:e2e
npm run cypress:open
```

## Content

Topic files are `resources/en/*_*.md` and `resources/ru/*_*.md` (same basenames). The public catalog is `lib/catalog`. Files not listed there (personal notes, link hubs) are not published. Locale sync rules: `.cursor/rules/locale-sync.mdc`.

How to split: **track** → optional **subject** (HTML, CSS, JavaScript, React, …) → **cluster** (Core / Browser / Additional, or subject-specific names) → **topic** (one markdown file / one page) → **concept** (one `<details>` accordion). Rules and examples: `/instructions`.

Set `NEXT_PUBLIC_SITE_URL` (no trailing slash) for absolute sitemap and robots URLs in production. On Vercel, production URL is inferred when that env is unset.

## CI/CD

### Study notes on deploy (mc-app + [mc-content](https://github.com/MyConspect/mc-content))

Notes live in **mc-content** (`en/` + `ru/` at repo root, or the same under `resources/`). Set these **environment variables** on [Vercel](https://vercel.com/docs/projects/environment-variables) (Production + Preview) and as [GitHub Actions secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) when CI must clone notes:

| Variable              | Required | Purpose                                                              |
| --------------------- | -------- | -------------------------------------------------------------------- |
| `RESOURCES_GIT_URL`   | Yes      | HTTPS clone URL, e.g. `https://github.com/MyConspect/mc-content.git` |
| `RESOURCES_GIT_TOKEN` | No       | PAT with repo read access — only if the notes repo is private        |
| `RESOURCES_GIT_REF`   | No       | Branch or tag (default `main`)                                       |

`prebuild` / `predev` run `tsx scripts/ensure-resources.ts`: if `resources/en/` already has markdown (your machine), nothing is downloaded; otherwise the script shallow-clones the notes repo.

GitHub Actions:

- `.github/workflows/ci.yml` — `npm ci`, lint, tests, `check-order`, production build, and Cypress sidebar E2E (Chrome) on push and PRs to `main` / `dev` (needs the secrets above)
- `.github/workflows/check-conspect.yml` — scheduled source URL audit (same secrets)

Production and preview deploys run automatically through the [Vercel GitHub integration](https://vercel.com/docs/git/vercel-for-github): push to **`MyConspect/mc-app`** `main` ships production; pull requests get preview URLs. Install the [Vercel GitHub App](https://github.com/apps/vercel) on the **MyConspect** org with access to **mc-app** if the project is not already connected.

### Production not updating after pushes to `main`

**Symptom:** GitHub Actions on `main` run, but the [Vercel project](https://vercel.com/docs/projects/overview) (**myconspect**) shows no new deployments and production stays on an old commit.

**Root cause (stale Git link after repo move):** `mc-app` lives under **`MyConspect/mc-app`**, but Vercel can still be linked to the pre-transfer owner (`radomir-radionov/mc-app`). The stored `link.org` in project settings may not match the org that receives pushes. Webhooks from **MyConspect** then never start a build, even though `productionBranch` is still `main` and CI on GitHub succeeds.

**Fix:**

1. Vercel → **myconspect** → **Settings → Git** — connected repository must be **`MyConspect/mc-app`**, production branch **`main`** (disconnect and reconnect if the owner is wrong).
2. GitHub → **MyConspect** org → **GitHub Apps** → **Vercel** — grant access to **mc-app**.
3. Redeploy latest **`main`** once (Deployments → Redeploy, or an empty push).

GitHub CI failing (e.g. Cypress on `main`) does not by itself stop Vercel unless you enabled deployment checks that wait on those workflows.
