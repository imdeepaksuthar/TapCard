# TapCard / Card Setu — Production Deployment Checklist

The code is production-ready. The items below require **your** servers and
credentials (which is why they can't be committed). Work top to bottom.

---

## 1. Frontend build environment (Next.js)

`NEXT_PUBLIC_*` values are **inlined at build time**, so set these in the
environment that runs `npm run build` (or a `.env.production` file on the build
host — it is gitignored). A build made against the committed `.env.local` will
point at `localhost` and be dead in production.

```dotenv
# The Laravel API base (no trailing slash)
NEXT_PUBLIC_API_URL=https://cardsetu.com/backend/public
# The public site origin — used for canonical URLs, robots.txt, sitemap.xml, JSON-LD
NEXT_PUBLIC_SITE_URL=https://cardsetu.com
```

After building, **verify the bundle** doesn't contain `localhost:8000`:
```bash
grep -r "localhost:8000" .next/ | head   # should print nothing
```

## 2. Backend environment (Laravel `.env`)

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cardsetu.com/backend/public
APP_KEY=            # php artisan key:generate

# Frontend origin + CORS (comma-separated allowed origins)
FRONTEND_URL=https://cardsetu.com
CORS_ALLOWED_ORIGINS=https://cardsetu.com,https://www.cardsetu.com

# Database
DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

> Keep the canonical domain **consistent** across `NEXT_PUBLIC_SITE_URL`,
> `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `next.config.js` image
> `remotePatterns`.

## 3. Email (hard blocker — login depends on it)

With `MAIL_MAILER=log`, **no email is delivered** — OTP login and password reset
will not work. Set a real transport and a verified sending domain (SPF/DKIM):

```dotenv
MAIL_MAILER=smtp          # or ses / postmark / resend
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS="no-reply@cardsetu.com"
MAIL_FROM_NAME="Card Setu"
```

Test: `php artisan tinker` → `Mail::raw('test', fn($m)=>$m->to('you@x.com')->subject('t'));`

## 4. Queue worker (required — some mail is queued)

Some notifications are queued (`QUEUE_CONNECTION=database`), so a worker **must**
run or those emails never send. Use the supervisor config in
[`deploy/tapcard-worker.conf`](deploy/tapcard-worker.conf):

```bash
sudo cp deploy/tapcard-worker.conf /etc/supervisor/conf.d/
sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl start tapcard-worker:*
```

## 5. Scheduler + database backups

Add one cron entry so Laravel's scheduler runs:
```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Install automated backups and schedule them:
```bash
composer require spatie/laravel-backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```
Then in `backend/routes/console.php`:
```php
use Illuminate\Support\Facades\Schedule;
Schedule::command('backup:clean')->daily()->at('01:00');
Schedule::command('backup:run')->daily()->at('01:30');
```

## 6. Error monitoring (Sentry)

**Backend:** `composer require sentry/sentry-laravel` → `php artisan sentry:publish --dsn=...`
(reads `SENTRY_LARAVEL_DSN`, already stubbed in `.env.example`).

**Frontend:** `npx @sentry/wizard@latest -i nextjs` and set `SENTRY_DSN` in the build env.

## 7. Go-live commands (backend)

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache          # picks up all API routes incl. the new ones
php artisan view:cache
```

---

## Remaining product decisions (not infra)

- **Monetization:** the `plans`/`subscriptions` schema exists but nothing is
  enforced or charged. Either integrate Razorpay + enforce plan limits at create
  time, or hide the paid-tier pricing UI for a free launch.
- **Auth token storage (H3/M5):** move the token from `localStorage` to an
  HttpOnly cookie and drop the OAuth `?token=` URL param. The backend already
  issues an httpOnly cookie, so this is a focused frontend change — do it as its
  own PR with auth testing.
