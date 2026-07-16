# Performance

Desktop Lighthouse results for a production-like `vite preview` build against a local API. Form factor: **Desktop**. Date: **2026-07-16**. Medians of **3 runs** per route.

## Results (median)

| Route | Perf | Acc | Best Practices | SEO | LCP | FCP | TBT | Transfer |
| ----- | ---- | --- | -------------- | --- | --- | --- | --- | -------- |
| `/season-1` | **99** | 100 | 100 | 100 | 958 ms | 476 ms | 0 ms | ~604 KiB |
| `/season-1/player/seb` | **99** | 100 | 100 | 100 | 1023 ms | 493 ms | 0 ms | ~495 KiB |
| `/season-1/dungeon/magisters-terrace` | **98** | 100 | 100 | 100 | 1053 ms | 494 ms | 0 ms | ~543 KiB |

> Scores vary by machine and network. Re-run with Desktop Lighthouse on `npm run preview` before citing numbers elsewhere.

## What we optimized

- Self-hosted fonts (Fontsource + LifeCraft with `font-display: swap`); no Google Fonts `@import`
- WebP asset budgets (banners, zones, logos resized/recompressed)
- LCP path: first home dungeon card uses `loading="eager"` + `fetchPriority="high"`
- Route-level `React.lazy` for player profile and dungeon detail
- Workbox: WebP out of precache; image **CacheFirst**; `/api` **NetworkOnly**
- Critical body CSS inlined in `index.html`
- `robots.txt` + single `<main>` landmark for a11y/SEO audits
- Explicit avatar width/height to reduce CLS
- Vercel immutable caching for hashed `/assets/*`

## Earlier baseline (context)

Before the Lighthouse optimization pass, Desktop home Performance was roughly **~80** with LCP dominated by a lazy-loaded dungeon card image. Post-optimization home Performance is typically **99** on Desktop for the same route family.
