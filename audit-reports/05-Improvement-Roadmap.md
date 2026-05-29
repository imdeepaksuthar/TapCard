# Card Setu — Suggested Improvement Roadmap

**Date:** 2026-05-28 · Effort: **S** ≈ <2h · **M** ≈ half-day · **L** ≈ 1–3 days · **XL** ≈ multi-day. Impact: ★ low → ★★★ high.

> Nothing here has been implemented. This is the proposed plan for your Phase-7 approval.

---

## Sprint 0 — Security & data integrity (LAUNCH BLOCKERS)

| ID | Task | Effort | Impact | Files |
|---|---|---|---|---|
| C2 | Gate `products`/`services` write routes behind admin role; scope catalog ownership | M | ★★★ | `routes/api.php:104-112`, `Api/ProductController`, `Api/ServiceController` |
| C8 | Scope public-card products/services to the card owner | M | ★★★ | `app/c/[slug]/page.tsx:20-45` + backend |
| C1 | Move session token to HttpOnly/Secure cookie (backend-set); stop reading from JS | L | ★★★ | `lib/api.ts`, `context/AuthContext.tsx`, backend |
| C1b | Stop passing OAuth token in URL; set cookie on redirect | M | ★★★ | `auth/callback`, `SocialAuthController` |
| C3 | Add `throttle` to auth + public endpoints | S | ★★★ | `routes/api.php` |
| C6 | Compute order total server-side; validate `card_slug` exists | M | ★★★ | `OrderController@store` |
| A1 | OTP brute-force protection (attempt cap, `hash_equals`, verified-email) | M | ★★ | `Api/OTPAuthController` |
| A4 | Fix CORS origins; add security headers | S | ★★ | `config/cors.php`, `next.config.js` |
| A3 | Validate upload MIME/extension; harden pincode proxy TLS | M | ★★ | `Api/MediaController`, `BusinessCardController` |
| C4 | Un-mock or remove Change Password | M | ★★★ | `settings/page.tsx:79` + backend endpoint |
| C5 | Replace fake GST verify with real API or clearly label/disable mock | M | ★★★ | `app/api/verify-gst/route.ts` |

**Exit criteria:** no privilege escalation across tenants; no fabricated "verified" data; tokens not JS-readable; auth endpoints rate-limited. Add backend tests for each authz fix.

---

## Sprint 1 — Public card page (highest-leverage route)

| ID | Task | Effort | Impact | Files |
|---|---|---|---|---|
| C7 | Add `generateMetadata` (title, description, canonical, OG/Twitter using the profile image) | M | ★★★ | `app/c/[slug]/page.tsx` |
| C9 | Lazy-load `Hero3DBackground` (`dynamic`, `ssr:false`) with `MeshGradient` fallback | S | ★★★ | `PublicCardView.tsx:840`, `CardForm.tsx:3970` |
| P1 | Gate 3D on device capability; fall back to `MeshGradient` on mobile/low-end | M | ★★★ | `Scene3D`, `Hero3DBackground` |
| H1 | Fix light/dark hydration flash (cookie or CSS `prefers-color-scheme`) | M | ★★ | `PublicCardView.tsx:293,370` |
| H2 | Fix share/QR URL first-paint (compute in effect/state) | S | ★ | `PublicCardView.tsx:462` |
| P2 | Switch card data from `no-store` to ISR `revalidate` | S | ★★ | `app/c/[slug]/page.tsx:10` |

---

## Sprint 2 — Performance & build

| ID | Task | Effort | Impact | Files |
|---|---|---|---|---|
| P3 | `tsconfig target: es5 → es2022` | S | ★★ | `tsconfig.json:3` |
| P4 | Migrate `<img>` → `next/image`; configure `images.remotePatterns` | L | ★★ | app-wide, `next.config.js` |
| P5 | Drop `Environment preset="city"` HDR (or desktop-only); unmount `Scene3D` after hero | M | ★★ | `Scene3D`, `Hero3DBackground`, `app/page.tsx:61` |
| P6 | Backend: pagination on all list endpoints | M | ★★ | `Api/*Controller` |
| P7 | Backend: composite index on `appointments(business_card_id,status,date)`; drop redundant `slug` index | S | ★★ | migrations |
| P8 | Fonts: adopt `next/font` (or confirm system stack is intentional) | S | ★ | `app/layout.tsx` |
| P9 | Eloquent API Resources to trim card payloads | M | ★ | `BusinessCardController` |

---

## Sprint 3 — Accessibility

| ID | Task | Effort | Impact | Files |
|---|---|---|---|---|
| B1 | `<MotionConfig reducedMotion="user">` at root + gate 3D loops | M | ★★ | `app/layout.tsx`, 3D components |
| B2 | Form label `htmlFor`/`id` + OTP `aria-label` | S | ★★ | auth pages, settings, login |
| B3 | Focus trap + `Escape` + `role="dialog"` on drawer/modals | M | ★★ | `dashboard/layout.tsx`, modals |
| B4 | Contrast bump for body text (`zinc-500/600` → `zinc-400/300`) | S | ★★ | global |
| B5 | Semantic `<section>`/headings on public card | S | ★ | `PublicCardView.tsx` |
| UX1 | **Add mobile navigation menu** (hamburger/drawer) | M | ★★★ | `Header.tsx:62` |

---

## Sprint 4 — Consistency, polish & safety net

| ID | Task | Effort | Impact | Files |
|---|---|---|---|---|
| UX2 | Sidebar `<a>` → `<Link>` | S | ★★ | `dashboard/layout.tsx:205` |
| UX3 | Replace native `alert()`/`confirm()` with custom modal | M | ★★ | leads, orders, appointments, products, dashboard |
| UX4 | Remove/disable dead buttons + fake "+12%" stat; wire footer links | S | ★★ | settings, dashboard, page |
| UX5 | Upload progress/error UI in CardForm | M | ★★ | `CardForm.tsx` |
| Q1 | Add `error.tsx`, `not-found.tsx`, `loading.tsx` | S | ★★ | `app/` |
| Q2 | Centralize + gate UI audio; fix AudioContext leak | S | ★ | `cards/page.tsx:145`, `PublicCardView.tsx:378` |
| CQ1 | Split `CardForm` into step components + `useReducer` | XL | ★★ | `CardForm.tsx` |
| T1 | Playwright happy-path E2E + Pest authz/auth/order tests | L | ★★★ | new |
| CL1 | Remove dead imports/vars, PII logs, backup asset | S | ★ | various |

---

## Quick wins (high impact ÷ effort — do opportunistically)

1. `es5 → es2022` (S, ★★)
2. Lazy-load `Hero3DBackground` (S, ★★★)
3. Add `throttle` to auth routes (S, ★★★)
4. Fix CORS + security headers (S, ★★)
5. `<MotionConfig reducedMotion>` (S→M, ★★)
6. Sidebar `<Link>` + remove dead buttons + fake stat (S, ★★)
7. Add `error.tsx`/`not-found.tsx` (S, ★★)

---

## Deployment / production-readiness checklist

**Security**
- [ ] Tokens HttpOnly/Secure; not in URL or JS storage
- [ ] All write endpoints authorized (tenant/role) + tested
- [ ] Rate limiting on auth + public endpoints
- [ ] Order totals computed server-side
- [ ] Upload MIME/extension validation; uploads on non-executable path
- [ ] CORS = exact prod origins; localhost removed
- [ ] Security headers (CSP/HSTS/X-CTO/Referrer-Policy/frame-ancestors)
- [ ] `APP_DEBUG=false`; PII debug logs removed; secrets via env/config (config-cache safe)

**Correctness**
- [ ] Change Password real (not mocked)
- [ ] GST verify real or clearly labeled mock
- [ ] Public card shows owner's catalog + has metadata
- [ ] No hydration warnings on any route

**Performance**
- [ ] Production `npm run build` First-Load JS captured; 3D lazy-loaded
- [ ] Lighthouse mobile ≥ 90 on `/` and `/c/[slug]`
- [ ] Images via `next/image`; `remotePatterns` set
- [ ] Backend list endpoints paginated; appointments index added

**Quality / ops**
- [ ] `error.tsx`/`not-found.tsx`/`loading.tsx` present
- [ ] Happy-path E2E green on Chrome/Safari/Firefox/Edge
- [ ] Backend test suite for auth + authorization + order pricing
- [ ] Mobile nav verified; public card verified on a real phone
- [ ] Reduced-motion + keyboard + contrast pass

---

## Before/after — what success looks like

| Metric | Before (est.) | Target after |
|---|---|---|
| Public-card mobile First-Load JS | ~600 KB+ (3D in main bundle) | < 200 KB (3D lazy/gated) |
| Public-card Lighthouse (mobile) | ~40–55 (est.) | ≥ 90 |
| SEO link preview on shared card | Blank/generic | Rich OG card w/ name + photo |
| Cross-tenant catalog exposure | Present | Eliminated |
| Session token XSS exposure | Full (JS-readable) | None (HttpOnly) |
| Reduced-motion support | 1 component | App-wide |
| Automated test coverage | ~0 | Happy-path E2E + authz unit tests |