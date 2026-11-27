# Vercel usage follow-up

## Changes in this pass

1. **`next.config.ts`** — `experimental.staleTimes.static: 31_536_000` (was default **300**; matches `x-nextjs-stale-time: 300` on production). Goal: stop ~5-minute ISR regen across the full static route surface.
2. **`proxy.ts`** — matcher skips `/_next` paths so static chunks do not run locale rewrites/redirects.
3. **Audits** — `docs/audits/vercel-usage-baseline.md` (this investigation).

Prior pass (on `main`): search-index immutable cache, deferred notes corpus, build-time site last updated.

## Verify after deploy

```bash
# Expect stale time >> 300 (often year-scale) once new build is live
curl -sI "https://myconspect.vercel.app/en/conspect/frontend/html-structure" | grep -iE 'x-nextjs-stale|cache-control'

curl -sI "https://myconspect.vercel.app/search-index/en/frontend.json" | grep -i cache-control
```

Local (after `npm run build && npm start`):

```bash
curl -sI "http://localhost:3000/en/conspect/frontend/html-structure" | grep -iE 'x-nextjs-stale|cache-control'
```

## Functional smoke

- [ ] `/en/conspect` and `/ru/conspect` load
- [ ] Legacy `/en/frontend/html` redirects to `/en/conspect/...` (proxy still runs on handbook paths)
- [ ] Notes search: switch to Notes, **type a query**, hits appear
- [ ] `npm run build` passes in CI

## Watch on Vercel (48h)

- **ISR Reads** — should **plateau** then **drift down** as the 30-day window sheds the spike (not instant).
- **Fast Origin Transfer** — lower **new** daily slope from fewer regens + less search JSON; huge HTML per page remains the long-term lever.

## If still over Hobby limits

- Upgrade to Pro, or
- Second project: reduce HTML payload (concept streaming / split), or enable **Cache Components** + `cacheLife('max')` on layouts (larger migration; see Next 16 migrating guide).
