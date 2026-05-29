# Card Setu — UI/UX Review Report

**Date:** 2026-05-28 · **Method:** Static review of all pages/components (read-only). Visual scores are expert estimates, not user-tested.

Severity legend: **C** Critical · **H** High · **M** Medium · **L** Low

---

## 1. Overall design assessment

The product has a **strong, coherent premium aesthetic**: near-black backgrounds, blue→indigo→purple gradient accents, glassmorphic surfaces, generous radii (`rounded-[2.5rem]`), and tasteful Framer Motion easing (`[0.16,1,0.3,1]`). The landing page is the high-water mark. Quality **drops inside the dashboard**, where consistency, accessibility, and feedback patterns lag the marketing surface.

The core UX problem is **inconsistency**, not lack of taste:
- Custom modals (Cards, Products) coexist with native `alert()` / `confirm()` (Leads, Orders, Appointments, Dashboard).
- Some navigation uses SPA `<Link>`; the dashboard sidebar uses full-reload `<a href>`.
- Some buttons are wired; several are decorative dead-ends.

---

## 2. Navigation, header & footer

| Sev | Finding | Location |
|---|---|---|
| **H** | **No mobile navigation menu.** The primary nav is `hidden md:flex` with no hamburger/drawer fallback, so on phones the Features/Pricing/FAQ links simply vanish. | `app/components/Header.tsx:62` |
| **H** | **Dashboard sidebar links are `<a href>`, not `<Link>`** — every dashboard navigation triggers a full page reload, re-running auth + re-fetching everything. | `app/dashboard/layout.tsx:205` |
| **M** | **All footer links are placeholders (`href="#"`)** — About, Careers, Blog, Privacy, Terms, and the social icons go nowhere. | `app/page.tsx:427-447` |
| **M** | Header logo and footer logo use raw `<img>` with no `width`/`height` → layout shift on load. | `Header.tsx:58`, `app/page.tsx:410` |
| **M** | Dashboard mobile sidebar drawer is not `Escape`-closable, has no `role="dialog"`, and does not trap focus. | `app/dashboard/layout.tsx:80` |
| L | Active-page title is a long ternary chain duplicating the sidebar label map; `/dashboard/appointments` falls through to "Dashboard". | `app/dashboard/layout.tsx:167-173` |
| ✓ | Scroll-driven glass header with IntersectionObserver scroll-spy is well built and performant. | `Header.tsx:15-43` |

---

## 3. Landing page (`app/page.tsx`)

| Sev | Finding | Location |
|---|---|---|
| **M** | `window.innerHeight` read **during render** → SSR computes `800`, client computes real height → hydration value mismatch feeding scroll transforms. Move to state in `useEffect`. | `app/page.tsx:59` |
| **M** | Lazy `Scene3D` has `fallback`/loading = nothing, so the hero card "pops in" after the ~600 KB chunk loads (perceived jank, not CLS). Provide a static placeholder. | `app/page.tsx:12,86` |
| L | `Image` from `next/image` is imported but never used (only raw `<img>`). Dead import. | `app/page.tsx:5,410` |
| L | FAQ answer container uses `max-h-40`; long answers would clip. Use `grid-rows` or auto height. | `app/page.tsx:371` |
| ✓ | Bento grid, sticky "How it works", pricing cards, animated CTA, and WhatsApp FAB are all well-composed with `whileInView` + `viewport once`. | `app/page.tsx:172-403` |

---

## 4. Authentication pages (login / register / forgot / reset / verify / callback)

| Sev | Finding | Location |
|---|---|---|
| **H** | **Register "GitHub" button has no `type`**, so inside the form it defaults to `type="submit"` and submits registration when clicked. | `app/(auth)/register/page.tsx:197` |
| **M** | Reflected error string: the login page reads an error message straight from the URL query and renders it — usable for phishing-style messaging. Whitelist known codes. | `app/login/page.tsx:44` |
| **M** | Near-identical inline `<style>` keyframe blocks are duplicated across 5 auth pages, leaking global class names (`.auth-input`, `.auth-btn`). Extract to shared CSS. | login / register / forgot / reset / callback |
| **M** | OTP digit inputs have no accessible name (`aria-label`) — screen readers announce six identical "edit text" fields. | `app/login/page.tsx:491-527` |
| L | OAuth callback Suspense fallback is an unstyled `Loading...` div — jarring vs. the polished inner loader. | `app/auth/callback/page.tsx:159` |
| L | `useRouter` imported but unused in the email-verify route. | `app/verify-email/[id]/[hash]/page.tsx:4` |
| ✓ | Loading spinners + `disabled` submit guards, OTP resend countdown with cleanup, password show/hide, per-field server-error mapping, and a correct `<Suspense>` wrap in `verify-email`. |  |

> Security aspects of auth (token storage, token-in-URL) are detailed in `04-Security-Accessibility-Report.md`.

---

## 5. Dashboard pages

| Sev | Finding | Location |
|---|---|---|
| **C** | **`CardForm.tsx` is a single 4,466-line client component** (5-step wizard + GST/pincode/geo + uploaders + live preview), re-rendering the whole tree on every keystroke via one giant spread-updated `formData`. Split into step components + reducer. | `app/dashboard/cards/CardForm.tsx` |
| **H** | **Settings "Change Password" is mocked** — `setTimeout` then "Password updated successfully!" with no API call. | `app/dashboard/settings/page.tsx:79-81` |
| **H** | File uploads in CardForm show **no progress/loading/error UI**; failures only `console.error`. User clicks and nothing visibly happens. | `CardForm.tsx:792-830` |
| **M** | Dead/decorative buttons presented as functional: "Delete Account" (Settings), "View All" and per-lead "⋮" (Dashboard). | `settings:229`, `dashboard/page.tsx:219,251` |
| **M** | Hardcoded fake "+12% since last month" trend on every stat card. | `app/dashboard/page.tsx:518` |
| **M** | Native `alert()` / `confirm()` used for create/update/delete across Leads, Orders, Appointments, Products toggles, and Dashboard — inconsistent with the app's custom modals. | leads, orders, appointments, products, dashboard |
| **M** | QR/share URL built from `window.location.origin` **during render** → hydration mismatch; first paint shows empty/placeholder URL. | `app/dashboard/page.tsx:325-346` |
| **M** | Profile update succeeds but does not refresh `AuthContext`, so the sidebar/header name stays stale until reload. | `app/dashboard/settings/page.tsx:59` |
| **M** | Several mutating handlers `console.error` silently on failure (no toast): card delete, lead status/delete, appointment status. | cards, leads, appointments |
| L | Status fields call `.toUpperCase()`/`.charAt(0)` on possibly-null values → runtime crash risk. | `leads:162`, `appointments:136` |
| ✓ | Cards page: custom confirm modal with loading + double-submit guard, optimistic removal, responsive grid. Products/Orders: search/filter/sort, carousels, optimistic toggles, full state coverage. |  |

---

## 6. Public card page (`/c/[slug]`) — highest-traffic route

| Sev | Finding | Location |
|---|---|---|
| **C** | **No SEO metadata** (no `generateMetadata`): no title/description/OG/Twitter on the page strangers actually open. (See SEO section in `02`/`04`.) | `app/c/[slug]/page.tsx` |
| **C** | **Shows the global catalog**, not the card owner's products/services. | `app/c/[slug]/page.tsx:20-45` |
| **H** | **Guaranteed light/dark hydration flash**: `isDark` defaults `true` for SSR, then flips to system preference in `useEffect`. | `PublicCardView.tsx:293,370-382` |
| **H** | Entire page is one 2,555-line `'use client'` component; mostly-static content (bio, hours, company) could be server-rendered for better LCP. | `app/c/[slug]/PublicCardView.tsx` |
| **M** | Share/QR URL seeded with hardcoded `https://tapcard.com/...` then swapped to `window.location.href` post-mount → wrong URL on first paint. | `PublicCardView.tsx:462-468` |
| **M** | Assigns `window.playUISound = ...` (global pollution); client-side checkout pincode lookup calls third-party `api.zippopotam.us` with no abort on rapid typing. | `PublicCardView.tsx:378,409` |
| L | Profile/gallery/product/QR images all use raw `<img>` (no lazy/responsive). | `PublicCardView.tsx:891,1202,1408,2072` |
| ✓ | `aria-label`s on share/theme buttons, `rel="noreferrer"` + `target="_blank"` on external links, Web Share API with clipboard fallback, vCard download with `tel:` fallback, `useMemo` for product filtering. |  |

---

## 7. Visual modernization recommendations (Phase 2)

These are **opt-in enhancements**, ordered by value-to-effort. None are bugs.

**Layout & hierarchy**
- Establish a **spacing scale** and apply it consistently in the dashboard (cards currently mix `p-6/p-8/p-10`). A single rhythm (4-pt scale) sharpens perceived quality.
- Standardize **card surfaces**: pick one border (`border-zinc-800/50`), one radius tier per context (xl for cards, full for pills), one shadow recipe.
- Add a **light theme** for the dashboard (currently dark-only); many B2B users expect it.

**Typography**
- Adopt `next/font` (e.g., Geist or Inter) instead of the system `font-sans` — see Performance report. This both improves rendering and removes a FOUT risk.
- Tighten the type scale: the landing uses `tracking-tighter` well; carry it into dashboard headings for consistency.

**Color & CTA**
- The white primary CTA on black is strong. In the dashboard, the blue CTAs and red destructive buttons are good, but **destructive actions should always confirm via the custom modal** (currently inconsistent).
- Audit contrast: `text-zinc-500`/`text-zinc-600` on near-black fails WCAG AA for body text (see Accessibility report).

**Glassmorphism / depth**
- The glass header and badges are tasteful. Avoid stacking blur over the WebGL canvas on mobile (compositing cost). Reserve heavy `backdrop-blur-xl` for small surfaces.

**Micro-interactions (lightweight, recommended)**
- Skeleton loaders for dashboard lists (cards/leads/orders) instead of full-screen spinners — improves perceived speed.
- Button press states already exist (`active:scale-95`); extend to dashboard buttons for tactile feedback.
- Page transitions via Framer Motion `AnimatePresence` on route change (subtle fade/slide), **gated by `prefers-reduced-motion`**.

**Animation guardrails (important)**
- Wrap the app in `<MotionConfig reducedMotion="user">` so all motion respects OS settings.
- Cap continuous/looping animations; the infinite 3D spins (`SectionDivider3D`) and float loops should pause under reduced-motion.

---

## 8. Audio experience review (Phase 3)

The app already ships a Web-Audio click/feedback system (`playUISound`) used on the Cards page and public card.

| Sev | Recommendation |
|---|---|
| **M** | **Performance bug:** a new `AudioContext` is created per sound and never closed (`cards/page.tsx:145`). Browsers cap concurrent AudioContexts (~6) — heavy interaction can throw/leak. Use one shared, lazily-created context. |
| **M** | `window.playUISound` is assigned globally (`PublicCardView.tsx:378`) — scope it to a module/hook instead. |
| **M** | **Accessibility/consent:** sound should be **off by default** with a user toggle, and must never be the *only* feedback channel. Respect a "reduce sound" preference. |
| L | Keep effects subtle and short (<120 ms), low-volume, and tied to meaningful actions (success, add-to-cart) — not every hover. Current usage is reasonable; just gate and centralize it. |

Verdict: **subtle UI audio is a fine premium touch and already partly implemented.** Centralize it, make it opt-in, and fix the AudioContext leak. Do **not** add transition/notification audio site-wide.

---

## 9. Prioritized UI/UX fix list

1. Add a **mobile nav menu** (Header) — H
2. Sidebar `<a>` → `<Link>` (kill full reloads) — H
3. Un-mock or remove **Change Password** — H
4. Fix public-card **hydration flash** + share URL — H
5. Replace native `alert()`/`confirm()` with the existing modal pattern — M (broad)
6. Remove/disable dead buttons & the fake "+12%" stat — M
7. Add upload progress/error UI in CardForm — M
8. Wire footer links (or mark "coming soon") — M
9. Split `CardForm` into step components + reducer — M (large)
10. Add skeleton loaders + `MotionConfig reducedMotion` — M