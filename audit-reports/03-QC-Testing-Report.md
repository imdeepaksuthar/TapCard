# Card Setu — QC & Testing Report

**Date:** 2026-05-28 · **Method:** Static QC analysis (code-level). **No live browser/device matrix was executed** — this report identifies defects, correctness risks, and the gaps a manual/automated QC pass must cover. A live test plan is provided in §6.

Severity: **C** Critical · **H** High · **M** Medium · **L** Low

---

## 1. Functional defects found by code inspection

| Sev | Defect | Location | Expected vs. actual |
|---|---|---|---|
| **C** | **Change Password does nothing** | `app/dashboard/settings/page.tsx:79-81` | Shows "Password updated successfully!" but makes no API call. |
| **C** | **GST verification returns fabricated company data** | `app/api/verify-gst/route.ts:42-76` | Any format-valid GSTIN "verifies" with invented legal/trade names, always `status: Active`. |
| **C** | **Public card lists the wrong catalog** | `app/c/[slug]/page.tsx:20-45` | Should show the card owner's items; actually fetches the unscoped global `/api/products` + `/api/services`. |
| **H** | **Register "GitHub" button submits the form** | `app/(auth)/register/page.tsx:197` | No `type="button"`, so it defaults to submit. |
| **H** | **Services price sort breaks** | `app/dashboard/services/page.tsx:242` | `a.price - b.price` with nullable price yields `NaN`, scrambling order; also a TS type violation. |
| **H** | **File uploads give no feedback** | `CardForm.tsx:792-830` | Failures only `console.error`; user sees nothing. |
| **M** | **Checkout total trusts client prices** | `OrderController@store` | Order total computed from client-supplied `cart_items[].price`. |
| **M** | **Proprietor image upload mutates state in place** | `CardForm.tsx:874-876` | Shallow spread mutates original object → possible stale/region render bugs. |
| **M** | **Dead buttons presented as functional** | `settings:229` (Delete Account), `dashboard:219,251` (View All, ⋮) | Clicking does nothing. |
| **M** | **Null-field method calls can throw** | `leads:162`, `appointments:136` | `.toUpperCase()`/`.charAt(0)` on possibly-null `status`. |
| **M** | **Service price serialized as `0` when null** | `Api/ServiceController.php:31,70,109` | `(float) null === 0.0` — "price on request" indistinguishable from free. Defeats the new nullable-price migration. |
| **M** | **Dashboard lead simulator uses raw `fetch` w/o auth header** and reads `cards[0].id` which can be `undefined` | `dashboard/page.tsx:127-140` | 401 if endpoint isn't public; crash if no cards. |
| L | Dead vars/imports: `primaryColor` (`c/[slug]/page.tsx:86`), `next/image` imports, `useRouter` (verify), `res` (CardForm:1194), `secondaryColor` prop (Hero3DBackground:31). | various | Lint noise; tree-shaking won't catch all. |
| L | `console.log` of submission payload (PII) left in CardForm; `Log::info` PII dump in backend. | `CardForm.tsx:1174`, `BusinessCardController@update:150` | Leaks PII to logs/console. |

---

## 2. Hydration / rendering correctness

| Sev | Issue | Location |
|---|---|---|
| **H** | Public card light/dark flash — `isDark` defaults `true` (SSR) then flips to system preference. | `PublicCardView.tsx:293,370` |
| **M** | `window.innerHeight` read during render (landing hero). | `app/page.tsx:59` |
| **M** | `window.location.origin` read during render (dashboard QR/share). | `app/dashboard/page.tsx:325-346` |
| **M** | Share/QR URL hardcoded then swapped post-mount (public card). | `PublicCardView.tsx:462-468` |

These produce React hydration warnings and a visible first-paint correction — must be verified clean in the browser console after fixes.

---

## 3. Error handling & resilience

- **Silent failures:** card delete, lead status/delete, appointment status, and CardForm uploads only `console.error` — no user-visible error. QC should confirm every mutation surfaces success/failure.
- **No route-level boundaries:** there is no `app/error.tsx`, `app/not-found.tsx`, or `loading.tsx` anywhere. An unhandled render error shows the default Next error page; a 404 is generic. **Add these.**
- **Good:** `apiFetch` enforces a 10 s timeout and normalizes errors into `ApiError` with field-level `errors` — most forms map these correctly.

---

## 4. Test coverage (current state)

| Area | Status |
|---|---|
| Frontend unit/component tests | **None** (no test runner configured; no `*.test.tsx`). |
| Frontend E2E | **None.** |
| Backend feature/unit tests | **Stubs only** — `tests/Feature/ExampleTest.php` and `tests/Unit/ExampleTest.php` are the default Laravel/Pest examples. |
| CI | None detected. |

**Risk:** every change is hand-verified. For a SaaS handling auth, payments-adjacent orders, and PII, this is the single largest process gap.

**Minimum recommended coverage (post-fix):**
- Backend (Pest): auth (register/login/OTP/verify), authorization on cards/leads/orders/products/services (the IDOR/authz fixes **must** have tests), order total computed server-side, public card by slug.
- Frontend: a Playwright smoke suite covering register→verify→login→create card→view public card→capture lead→checkout. This single happy-path E2E would catch most regressions.

---

## 5. Cross-cutting QC observations

- **Consistency:** native `alert()`/`confirm()` vs. custom modals; `<a>` vs `<Link>`; `parseFloat(...toString())` defensive parsing in Orders but raw `.toFixed()` in Products. Standardize.
- **Authorization is cosmetic in the client:** `isAdmin = true` hardcoded on the Products page (`products/page.tsx:28`). Real enforcement must be server-side (see Security report) — QC should test as a non-admin user.
- **External dependency:** checkout pincode lookup calls `api.zippopotam.us` from the browser with no abort — QC should test rapid edits and offline behavior.

---

## 6. Recommended live QC test plan (to execute after fixes are approved)

**Functional (happy + edge):**
- Auth: register → email verify → login (password + OTP + Google) → logout; wrong password; expired/!verified; reset password end-to-end (currently the in-app change-password is mocked — test the real one once wired).
- Cards: create via 5-step wizard, all validations (phone/email/GST/IFSC/UPI/pincode), image uploads (success + oversize + wrong type), edit, delete, view live profile.
- Public card: open by slug, theme/dark toggle (verify no flash), share + QR + vCard download, lead capture, add-to-cart → checkout (verify server-side total).
- Dashboard CRUD: leads (filter/status/delete), orders (status/delete), products/services (as admin **and** non-admin), appointments (status), notifications.

**Responsive matrix:** 360×640 (small Android), 390×844 (iPhone), 768×1024 (iPad), 1280 / 1440 / 1920 desktop. Specifically verify the **mobile nav menu** (currently missing) and the public card on a real phone (NFC-tap context).

**Browser matrix:** Chrome, Edge, Firefox, Safari (incl. iOS Safari — important for WebGL/`AudioContext`/Web Share behavior). Confirm the 3D gracefully degrades where WebGL is blocked.

**Accessibility pass:** keyboard-only navigation of all forms/modals, screen-reader labels, contrast (see `04`), reduced-motion behavior.

**Console/network:** zero hydration warnings, zero 4xx/5xx on happy paths, no leaked PII in console.

---

## 7. QC sign-off checklist (gate for launch)

- [ ] All Critical defects (C1–C9 in the Executive Summary) resolved and retested.
- [ ] No console errors or hydration warnings on any route.
- [ ] Every data mutation shows explicit success/failure feedback.
- [ ] `error.tsx`, `not-found.tsx`, `loading.tsx` present.
- [ ] Authorization tested as a non-admin / different-tenant user.
- [ ] Happy-path E2E green in Chrome + Safari + Firefox + Edge.
- [ ] Responsive verified incl. mobile nav and public card on a real phone.
- [ ] Backend test suite covers auth + authorization + order pricing.