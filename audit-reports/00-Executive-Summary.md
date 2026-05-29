# Card Setu — Professional Audit: Executive Summary

**Project:** Card Setu (TapCard) — Digital business-card / NFC tap-card SaaS
**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Framer Motion 12 · Three.js / React-Three-Fiber · Laravel (Sanctum) backend · MySQL
**Audit date:** 2026-05-28
**Audit type:** Read-only analysis — **no code was modified.** All fixes await your approval (Phase 7).

---

## 1. Verdict at a glance

| Dimension | Score (0–100) | Status |
|---|---|---|
| Visual design / UI polish | 82 | Strong — premium dark aesthetic, good motion craft |
| UX flows & consistency | 64 | Mixed — polished landing page, rough dashboard edges |
| Performance (mobile) | 48 | **At risk** — dual WebGL contexts + ES5 + raw `<img>` |
| Accessibility | 45 | **Needs work** — labels, reduced-motion, contrast |
| SEO | 38 | **Poor** — public card page has no metadata at all |
| Security | 40 | **Critical gaps** — authz, token storage, rate limiting |
| Code quality / maintainability | 58 | Mixed — 4.4k-line components, duplicated logic |
| Test coverage | 5 | **None** — no frontend tests; backend has only stubs |

**Production-readiness: NOT READY.** There are 9 issues rated *Critical* that should block a public launch, several of which are security or data-integrity problems rather than cosmetic ones.

---

## 2. The 9 Critical issues (must-fix before launch)

| # | Issue | Where | Why it matters |
|---|---|---|---|
| C1 | **Auth token stored in `localStorage` + non-HttpOnly cookie**, and the OAuth callback passes the token in the URL | `lib/api.ts:54`, `context/AuthContext.tsx:82`, `app/auth/callback/page.tsx:23` | Any XSS (or browser-history/log leak) steals a full 30-day session. |
| C2 | **Products & Services write endpoints have no authorization** | `backend/routes/api.php:104-112`, `Api/ServiceController.php` / `ProductController.php` | *Any* logged-in user can edit or delete the **entire global catalog**. Defacement / data-loss vector. |
| C3 | **No rate limiting anywhere** | `backend/routes/api.php` (all routes) | Login & OTP brute-force, password-reset & lead/order **mail-bombing**. |
| C4 | **"Change Password" is faked** — shows success without calling any API | `app/dashboard/settings/page.tsx:79-81` | Users believe their password changed when it did not. Trust + security failure. |
| C5 | **GST verification returns fabricated data** | `app/api/verify-gst/route.ts:42-76` | Invents a "verified" legal/trade name from the PAN and autofills it onto the user's card. |
| C6 | **Checkout trusts client-supplied prices** | `backend/app/Http/Controllers/OrderController.php` | A customer can order at any price they choose. |
| C7 | **Public card page (`/c/[slug]`) has zero SEO metadata** | `app/c/[slug]/page.tsx` | The most-shared page has no `<title>`, description, canonical, or OpenGraph — link previews are blank, indexing is generic. |
| C8 | **Public card shows the *global* product/service catalog**, not the card owner's | `app/c/[slug]/page.tsx:20-45` | Every card displays the same items — wrong content + cross-tenant data exposure. |
| C9 | **Full WebGL hero (~600 KB of Three.js) is statically imported & SSR-rendered on the public card page** | `app/c/[slug]/PublicCardView.tsx:840`, `CardForm.tsx:3970` | The mobile-first, NFC-tap landing route ships and parses 600 KB+ before paint, plus runs two always-on WebGL contexts. |

---

## 3. Top themes

**Security is the weakest pillar.** The token-storage model, the missing authorization on the catalog, and the total absence of rate limiting are launch-blockers independent of any UI work.

**The public card page is the highest-leverage page and the least optimized.** It is the page strangers actually open (from a tapped card), yet it has no SEO metadata, ships the heaviest 3D bundle, shows the wrong catalog, and has a guaranteed light/dark hydration flash. Fixing this one route improves SEO, mobile performance, and correctness simultaneously.

**The design craft is genuinely good.** The landing page motion, the bento grid, the glass header, and the premium dark palette are well executed. The gap is not taste — it's *consistency* (native `alert()`/`confirm()` next to custom modals), *accessibility* (reduced-motion, labels, contrast), and *engineering hygiene* (ES5 target, `<img>` over `next/image`, 4.4k-line components).

**There is no automated safety net.** No frontend tests, backend tests are example stubs, and there are no `error.tsx` / `not-found.tsx` boundaries. Every change is currently validated by hand.

---

## 4. What is already done well

- Landing-page animation craft (Framer Motion easing, bento grid, sticky steps, scroll-spy header).
- `Scene3D` is correctly code-split (`dynamic(..., { ssr:false })`) — the model the other 3D component should follow.
- `MeshGradient` is GPU-cheap and the **only** component that respects `prefers-reduced-motion`.
- `apiFetch` has a 10s timeout/abort; CSV export is hardened (BOM + quote-escaping).
- Backend eager-loads relations well, caches homepage stats, avoids user-enumeration on forgot-password, and uses `hash_equals` for email verification.
- Good empty / loading / error / no-results states in Products, Services, Orders, and Leads pages.

---

## 5. Recommended sequencing (full detail in `05-Improvement-Roadmap.md`)

1. **Sprint 0 — Security & data integrity (blockers):** C1–C8. Mostly backend + a few frontend wiring fixes.
2. **Sprint 1 — Public card page:** SEO metadata (C7), scope catalog (C8), lazy-load 3D (C9), fix hydration flash.
3. **Sprint 2 — Performance & build:** ES5→modern target, `next/image` migration, image/font optimization, `next.config` hardening.
4. **Sprint 3 — Accessibility:** `MotionConfig reducedMotion`, form labels, contrast, keyboard/focus, mobile nav menu.
5. **Sprint 4 — Consistency & polish:** replace native dialogs, remove dead/fake UI, split `CardForm`, add tests + error boundaries.

---

## 6. Report index

| File | Contents |
|---|---|
| `00-Executive-Summary.md` | This document |
| `01-UIUX-Review-Report.md` | Visual design, UX flows, responsiveness, animation, audio recommendations |
| `02-Performance-Audit-Report.md` | Bundle, Core Web Vitals risks, 3D, images/fonts, backend query/caching |
| `03-QC-Testing-Report.md` | Functional / responsive / browser / form QC findings + test-coverage gaps |
| `04-Security-Accessibility-Report.md` | Security findings (severity-ranked) + WCAG accessibility findings |
| `05-Improvement-Roadmap.md` | Prioritized roadmap, effort/impact, deployment checklist |
| `findings.json` | Machine-readable consolidated findings (all severities) |

> **Scoring note:** scores are qualitative expert estimates from static analysis, not measured Lighthouse runs. The Performance report explains how to capture real Lighthouse/Core-Web-Vitals numbers, which I recommend before/after fixes.