# Card Setu — Security & Accessibility Report

**Date:** 2026-05-28 · **Method:** Static code review (read-only). Not a penetration test; findings are code-level and should be confirmed against the deployed environment.

Severity: **C** Critical · **H** High · **M** Medium · **L** Low

---

# PART A — SECURITY

## A1. Authentication & session

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **C** | **Session token stored in `localStorage` AND a non-HttpOnly, non-Secure cookie** (`SameSite=Lax`, 30-day). Readable by any JS → XSS = full account takeover. | `lib/api.ts:54`, `context/AuthContext.tsx:82,105` | Issue the session as an **HttpOnly; Secure; SameSite=Strict/Lax** cookie set by the backend; never expose the token to JS. |
| **C** | **OAuth token passed in the URL** (`?token=`) and then persisted client-side. Lands in browser history, server access logs, and `Referer` headers. | `app/auth/callback/page.tsx:12,23-24`, `SocialAuthController@handleGoogleCallback` | Have the backend set the HttpOnly cookie on the redirect; don't put tokens in query strings. |
| **H** | **No rate limiting on auth** (login, OTP send/login, register, forgot/reset). Enables credential & OTP brute-force and mail/SMS-cost abuse. | `backend/routes/api.php` (all) | Add `throttle:5,1` to auth endpoints, `throttle:60,1` to public reads. |
| **H** | **OTP login is brute-forceable**: 6-digit code, 10-min window, **no attempt cap**, non-constant-time `!==` compare; also bypasses the email-verified check that `/login` enforces. | `Api/OTPAuthController.php:55-96` | Cap attempts, invalidate after N failures, use `hash_equals`, require verified email. |
| ✓ | Forgot-password avoids user enumeration; email verification uses `hash_equals`. | `PasswordResetController:28`, `AuthController:155` | Keep. |

## A2. Authorization (access control)

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **C** | **Products & Services write endpoints have no authorization or role gate** — the route file literally comments "All authenticated users can manage products". Since the catalog is global (no `user_id`), *any* logged-in user can create/edit/delete/deactivate the **entire catalog**. | `backend/routes/api.php:104-112`, `Api/ProductController.php` & `Api/ServiceController.php` `store/update/destroy` | Gate behind admin role middleware (`admin`,`super_admin`), or add per-user ownership if intended. |
| **C** | **Public card exposes the global catalog cross-tenant** (same root cause as above + the unscoped frontend fetch). | `app/c/[slug]/page.tsx:20-45` | Scope products/services to the card owner server-side. |
| **M** | **Client-side authz is cosmetic**: `isAdmin = true` hardcoded on the Products page. Provides no protection (server must enforce). | `app/dashboard/products/page.tsx:28` | Derive role from the authenticated user; rely on server checks. |
| L | `role`/`status` are in `User::$fillable` — no current escalation path, but risky if a future endpoint does `User::update($request->all())`. | `app/Models/User.php:14` | Remove from `$fillable`; set explicitly. |

## A3. Input handling, uploads & injection

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **H** | **Checkout trusts client-supplied item prices** to compute order total. | `OrderController@store` | Look up prices server-side from Product/Service; validate `card_slug` with `exists`. |
| **M** | **File upload validates size + a `type` enum but not MIME/extension.** A renamed `.svg`/`.html`/`.php` can be stored on the public disk → stored XSS (SVG/HTML) or worse if the path is executable. Extension is taken from the client. | `Api/MediaController.php:20-23` | Add `mimes:jpg,jpeg,png,webp,gif,pdf`; derive extension server-side; serve uploads from a non-executable location. |
| **M** | **Pincode proxy disables TLS verification** (`CURLOPT_SSL_VERIFYPEER/HOST=false`) with `FOLLOWLOCATION=true` → MITM-able. | `BusinessCardController@verifyPincode:271-278` | Use Laravel `Http::` with TLS verification on; drop follow-redirects. |
| **M** | **Public lead & order endpoints are unthrottled and send email** to the owner + all super-admins per request → mail-amplification/spam. | `LeadController@store`, `OrderController@store` | Rate-limit; consider captcha/honeypot on public forms. |
| **M** | **Reflected error text** rendered from a URL query param on the login page. | `app/login/page.tsx:44` | Whitelist known error codes → fixed strings. |
| ✓ | No raw/interpolated SQL — all Eloquent/parameterized. Models use explicit `$fillable`. `.env` not committed; no hardcoded secrets. | — | Keep. |

## A4. Configuration & transport

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **H** | **CORS misconfigured**: production origins include **trailing slashes/paths** (`https://tapcard.mamtastationery.com/`, `.../backend/public`) which never match scheme+host, while bare `localhost`/`127.0.0.1` may stay allowed in prod — with `supports_credentials=true`. | `backend/config/cors.php:22-32` | Use exact `scheme://host[:port]` origins; remove localhost in production. |
| **M** | **No security headers** configured (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options/frame-ancestors). | `next.config.js` (and server) | Add a `headers()` block in `next.config.js` and/or web-server config. |
| **L** | Controllers call `env()` directly (`FRONTEND_URL`) — returns `null` when config is cached, silently falling back to a dev URL in production. | `SocialAuthController`, `PasswordResetController` | Move to a `config/*.php` entry and use `config()`. |
| **L** | Debug logs leak PII: `Log::info` dumps `personal_info`; `console.log` dumps the submission payload. | `BusinessCardController@update:150`, `CardForm.tsx:1174` | Remove before production. |

## A5. Data lifecycle

| Sev | Finding | Recommendation |
|---|---|---|
| **M** | **No soft deletes**; deleting a card cascades and permanently wipes its leads/related history. | Add `SoftDeletes` to at least cards/leads/orders. |
| L | Product/Service slugs are `slug-<random5>` with a DB-unique constraint but **no collision retry** → rare unhandled `QueryException` (500). | Add a retry-on-collision loop. |

---

# PART B — ACCESSIBILITY (WCAG 2.1 AA orientation)

## B1. Motion & vestibular safety

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **H** | **No global reduced-motion handling.** Infinite 3D spins and float loops run regardless of OS setting — a vestibular-trigger risk. | `SectionDivider3D.tsx:30` (infinite `rotateX/Y:360`), `Scene3D.tsx`, `Hero3DBackground.tsx` | Wrap app in `<MotionConfig reducedMotion="user">` **and** gate `useFrame`/`<Float>`/`MeshDistort` behind `prefers-reduced-motion`. |
| **M** | `Tilt3D` comment claims it respects reduced motion but **only** handles touch — desktop reduced-motion users still get tilt. | `Tilt3D.tsx:17-18,37` | Add the `matchMedia('(prefers-reduced-motion: reduce)')` short-circuit it claims to have. |
| **M** | `FlipCard3D` cursor tilt ignores reduced motion. | `FlipCard3D.tsx:30` | Gate the tilt; keep tap-to-flip. |
| L | `scroll-behavior: smooth` is global with no reduced-motion exception. | `app/globals.css:9` | Wrap in `@media (prefers-reduced-motion: no-preference)`. |
| ✓ | `MeshGradient` correctly disables its animation under reduced motion — the model to copy. | `MeshGradient.tsx:79-81` | — |

## B2. Forms & labels

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **M** | **Form labels lack `htmlFor`/`id` association** across login, register, forgot, reset, and settings — clicking the label doesn't focus the field; SR association is positional only. | auth pages, `settings/page.tsx` | Add `htmlFor`/matching `id`. |
| **M** | **OTP inputs have no accessible name.** Six fields announce as "edit text". | `app/login/page.tsx:491-527` | `aria-label={`Digit ${i+1}`}`. |
| ✓ | Products/Services modals **do** use `htmlFor` correctly — apply the same everywhere. | `products/page.tsx:592` | — |

## B3. Structure, semantics & images

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **M** | Public card content sections (Connect, Business, Gallery) are styled `<div>`s, weakening heading hierarchy after a single `<h1>`. | `PublicCardView.tsx` | Use semantic `<section>` + `<h2>`/`<h3>`. |
| **M** | **Images use raw `<img>`** — verify all have meaningful `alt` (decorative → `alt=""`). Several logos/QRs rely on generic alt. | app-wide | Audit `alt` text during the `next/image` migration. |
| ✓ | Public card share/theme buttons have `aria-label`; decorative 3D dividers are `aria-hidden`; external links use `rel="noreferrer"`. | `PublicCardView.tsx` | — |

## B4. Keyboard & focus

| Sev | Finding | Location | Recommendation |
|---|---|---|---|
| **M** | Mobile sidebar drawer doesn't trap focus, isn't `Escape`-closable, and the overlay has no `role`. | `app/dashboard/layout.tsx:80` | Add focus trap, `Escape` handler, `role="dialog"`/`aria-modal`. |
| **M** | Custom modals/FAQ accordion should be checked for focus management and `aria-expanded`/`aria-controls`. | landing FAQ, dashboard modals | Add ARIA state + focus return on close. |
| L | FAQ toggle button uses `focus:outline-none` with no visible replacement focus ring. | `app/page.tsx:366` | Provide a visible focus style. |

## B5. Color contrast

| Sev | Finding | Recommendation |
|---|---|---|
| **M** | Body/secondary text in `text-zinc-500` / `text-zinc-600` on near-black backgrounds likely **fails WCAG AA (4.5:1)** for normal text (it's used widely for descriptions, footer, captions). | Audit with a contrast checker; bump to `zinc-400`/`zinc-300` for body copy, reserve `zinc-500/600` for large/decorative text only. |

---

## Combined security + a11y priority list

**Security (do first — launch blockers):**
1. Move session token to HttpOnly cookie; stop token-in-URL (C). 
2. Authorize products/services writes + scope public catalog (C).
3. Add rate limiting across auth + public endpoints (H).
4. OTP brute-force protection (H).
5. Server-side order pricing + `card_slug` exists (H).
6. Fix CORS origins; add security headers (H/M).
7. Validate upload MIME/extension; harden pincode proxy (M).

**Accessibility (high user impact, mostly low effort):**
1. `<MotionConfig reducedMotion="user">` + gate 3D loops (H).
2. Form label associations + OTP `aria-label` (M).
3. Focus trap / `Escape` on drawer + modals (M).
4. Contrast bump for body text (M).
5. Semantic sections/headings on public card (M).