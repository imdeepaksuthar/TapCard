# Card Setu — Performance Audit Report

**Date:** 2026-05-28 · **Method:** Static analysis of bundle composition, rendering patterns, and backend queries. **No live Lighthouse run was performed** (see §7 for how to capture real numbers).

Severity: **C** Critical · **H** High · **M** Medium · **L** Low

---

## 1. Headline performance risks

The app's biggest performance liabilities are concentrated in **three decisions**, all fixable:

1. **A second full WebGL/Three.js scene is statically imported and SSR-rendered on the public card page** (the mobile-first, NFC-tap route).
2. **TypeScript compiles to `target: "es5"`**, forcing legacy transforms/polyfills into a React 19 / Next 16 app.
3. **Raw `<img>` is used everywhere** instead of `next/image`, forfeiting lazy-loading, responsive `srcset`, AVIF/WebP, and intrinsic sizing.

---

## 2. JavaScript bundle & 3D

| Sev | Finding | Location |
|---|---|---|
| **C** | **`Hero3DBackground` (full Canvas: three.js + fiber + drei + `MeshDistortMaterial`/`Sphere`/`TorusKnot`/`Environment`) is a plain static import** on the public card page and CardForm — ~600 KB+ of JS parsed before paint, on the most mobile-heavy route. **Fix:** `dynamic(() => import('.../Hero3DBackground'), { ssr:false })` with the CSS `MeshGradient` as the loading fallback. | `app/c/[slug]/PublicCardView.tsx:5,840`, `CardForm.tsx:14,3970` |
| **C** | **Two always-on WebGL contexts per public card** (`Hero3DBackground` + `MeshGradient`'s own effects), each driving a `requestAnimationFrame` loop with shader distortion — heavy battery/heat/GPU on phones, for a 176–240 px decorative banner. | `Hero3DBackground.tsx:39`, `PublicCardView.tsx:832,840` |
| **H** | **`Environment preset="city"` fetches a multi-MB HDR** at runtime in both 3D components, used only for reflections. Remove or restrict to desktop. | `Scene3D.tsx:225`, `Hero3DBackground.tsx:98` |
| **H** | **No device/capability gating** on any 3D. Phones render 280 particles, contact shadows, 4 lights, antialias, `dpr=[1,2]`. Gate behind a desktop media-query / `navigator.hardwareConcurrency` / `deviceMemory` and fall back to `MeshGradient`. | `Scene3D.tsx:211-217`, `Hero3DBackground.tsx:39` |
| **M** | `Scene3D` on the home page is only **faded** (`opacity→0`) when scrolled past — the canvas keeps rendering frames behind content. Unmount or use `frameloop="demand"`. | `app/page.tsx:61` |
| **H** | **`tsconfig target: "es5"`** bloats output with legacy helpers/iterators and prevents native modern syntax. Set to `ES2020`+ (`ES2022` recommended for Next 16). | `tsconfig.json:3` |
| ✓ | `Scene3D` is correctly code-split (`dynamic(..., { ssr:false })`) — the pattern `Hero3DBackground` should adopt. R3F auto-disposes JSX-primitive geometries on unmount (no major leak). | `app/page.tsx:12` |

**Heavy client components** (large hydration cost):
- `CardForm.tsx` — 4,466 lines, one `'use client'`, re-renders entire tree per keystroke.
- `PublicCardView.tsx` — 2,555 lines, one `'use client'`; most content is static and could be RSC.

---

## 3. Images

| Sev | Finding |
|---|---|
| **H** | **Raw `<img>` across the entire app** (logos, avatars, product/service galleries, QR codes). No lazy-loading, no responsive `srcset`, no `width`/`height` → cumulative layout shift + wasted bandwidth, especially on the image-rich public card and product galleries. |
| **M** | `next/image` is **imported but never used** in `app/page.tsx:5` and `app/c/[slug]/page.tsx:2` (dead imports). |
| **M** | `next.config.js` has **no `images` config** (`remotePatterns`/`domains`), so backend-served images can't even be used with `next/image` until configured. |
| L | `public/logo-dark-bkp.png` is an unused backup asset shipped in the public folder. |

**Recommendation:** migrate to `next/image` with explicit `sizes`/dimensions; configure `images.remotePatterns` for the Laravel `storage` host; enable AVIF/WebP (default in `next/image`). For the QR code, render at fixed dimensions to prevent shift.

---

## 4. Fonts & CSS

| Sev | Finding |
|---|---|
| **M** | **No web font is loaded** — UI relies on Tailwind's `font-sans` (system stack). If a brand font is intended, use `next/font` for self-hosting + `font-display: swap` + zero layout shift. If the system stack is intentional, that's actually optimal — just make it a deliberate decision. |
| **M** | **Duplicated inline `<style>` blocks** across 5 auth pages ship repeated CSS and pollute the global scope. Consolidate into `globals.css` / CSS modules. |
| L | `globals.css` sets `scroll-behavior: smooth` globally with no `prefers-reduced-motion` exception. |
| L | Tailwind 4 is configured via `@tailwindcss/postcss` with a minimal `@theme` — fine; ensure production build purges unused utilities (default in v4). |

---

## 5. Rendering & data-fetching patterns

| Sev | Finding | Location |
|---|---|---|
| **H** | **Auth gating is client-only** (no `middleware.ts`): dashboard pages mount, then redirect in `useEffect`, so protected UI briefly renders and re-runs auth on every navigation. A `middleware.ts` guard removes the flash and the wasted work. | all `app/dashboard/*` |
| **M** | **Fetch waterfall in the dashboard layout**: it fetches `/api/cards` just to decide menu visibility, *separately* from each page that also fetches `/api/cards`. Hoist to context. | `app/dashboard/layout.tsx:28-65` |
| **M** | Public card uses `cache: 'no-store'` for card data but `revalidate:60` for products/services — inconsistent caching on the highest-traffic page. Use ISR/`revalidate` for card data too. | `app/c/[slug]/page.tsx:10,23` |
| M | Several hydration mismatches (window/`location` read at render) force client re-paint — see UI/UX report §5–6. |  |
| ✓ | `Promise.all` is used for parallel fetches (dashboard, public card). `apiFetch` has a 10 s timeout/abort. `useMemo` used for filtered lists (orders, products). |  |

---

## 6. Backend performance (Laravel)

| Sev | Finding | Location |
|---|---|---|
| **H** | **No pagination on any list endpoint** — `cards`, `leads`, `appointments`, `orders`, `products`, `services`, `categories`, `notifications` all return `->get()`. Payloads grow unbounded. Add `->paginate()`. | controllers in `app/Http/Controllers/Api/` |
| **H** | **Missing composite index** on `appointments(business_card_id, status, date)` — queried on **every public card view**. | `BusinessCardController@showPublic`, appointments migration |
| **M** | **Large payloads**: card endpoints return the full model (~18 JSON blobs: gallery, documents, brochures, etc.). Use Eloquent API Resources to trim. | `BusinessCardController` |
| **M** | `views_count` is incremented with a DB write on every public view — under traffic, buffer/queue it. | `BusinessCardController@showPublic:190` |
| L | Redundant `index('slug')` on `business_cards` (the `unique()` already indexes it) — minor wasted write cost. | business_cards migration |
| ✓ | Eager loading is generally good (`with(['category','subcategory'])`, column-limited `with('businessCard:id,slug')`). Homepage stats cached 1 h. OTP cached appropriately. |  |

---

## 7. How to capture real Core Web Vitals / Lighthouse (recommended next step)

Before and after fixes, measure — don't guess:

```bash
# Production build (closest to real perf)
npm run build && npm run start
# In another shell, run Lighthouse against the key routes:
npx lighthouse http://localhost:3000/            --preset=desktop --view
npx lighthouse http://localhost:3000/            --form-factor=mobile --view
npx lighthouse http://localhost:3000/c/<a-real-slug> --form-factor=mobile --view   # most important
```

Also: `npm run build` prints per-route **First Load JS** — capture it now as a baseline, then again after lazy-loading `Hero3DBackground` and switching off `es5`.

**Targets (your stated goal: 90+):**
- Mobile LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- The public card route is the one to obsess over — it's both the heaviest and the most-visited by strangers.

---

## 8. Expected impact of the top performance fixes

| Fix | Primary metric moved | Est. impact |
|---|---|---|
| Lazy-load `Hero3DBackground` (`ssr:false`) | Mobile First-Load JS, LCP, TTI | **Large** (~600 KB off the public route's critical path) |
| Gate 3D / drop `Environment` HDR on mobile | LCP, battery, INP | Large on low-end devices |
| `es5` → `es2022` target | Bundle size, parse time | Medium across all routes |
| `<img>` → `next/image` | CLS, LCP, bandwidth | Medium–Large on image-heavy pages |
| Backend pagination + indexes | API latency at scale | Medium now, Large as data grows |
| Unmount `Scene3D` after hero | Home-page CPU/battery while scrolling | Medium |