# Vercel usage baseline (Hobby)

Date: 2026-11-27. Team `radomirs-projects`, project **myconspect**.

## Limits exceeded

| Metric               | Observed | Included |
| -------------------- | -------: | -------: |
| ISR Reads            |     1.2M |       1M |
| Fast Origin Transfer | 10.26 GB |    10 GB |

Hobby usage uses a **rolling 30-day window** ([docs](https://vercel.com/docs/plans/hobby)); totals fall only as old days age out, not on deploy.

## Production headers (after `4658ed1`, before `staleTimes` fix)

```text
GET /en/conspect/frontend/html-structure
  cache-control: public, max-age=0, must-revalidate
  x-nextjs-prerender: 1
  x-nextjs-stale-time: 300
  x-vercel-cache: HIT
  content-length: ~1.8 MB HTML

GET /search-index/en/frontend.json
  cache-control: public, max-age=31536000, immutable  (post first fix)
  content-length: ~3.3 MB
```

## Hypothesis table (ranked)

| #   | Cause                                                                                                                | Impact             | Status                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------ | -------------------------- |
| 1   | **Next 16 `experimental.staleTimes.static` default = 300s** → background ISR regen on all prerendered handbook pages | ISR reads          | Fix: set `static: 31_536_000` in `next.config.ts`                              |
| 2   | **Large HTML** (~1.8 MB/topic) × traffic and revalidation                                                            | Origin GB          | Monitor; structural split is a later project                                   |
| 3   | **Notes search JSON** (~19 MB all tracks)                                                                            | Origin GB          | Mitigated: load corpus only when query non-empty; long-cache `/search-index/*` |
| 4   | **Runtime `git` in layout** for “last updated”                                                                       | Extra server work  | Mitigated: `write-build-metadata.ts`                                           |
| 5   | \*\*`proxy.ts` on all `/en                                                                                           | ru/\*`\*\*         | Edge invocations / cache                                                       | Narrowed: exclude `/_next` |
| 6   | **Duplicate production deploys** (Git + CI)                                                                          | Build/upload churn | Manual: README CI section                                                      |

## Repo scan (dynamic / cache)

- `app/[locale]/layout.tsx`: `revalidate = false` (ignored under Next 16 defaults; use `staleTimes` / Cache Components)
- `app/api/dev/resources-refresh/route.ts`: `force-dynamic` (404 in prod)
- All handbook pages: `generateStaticParams`, `dynamicParams = false`
- No runtime `fetch` for concept bodies
