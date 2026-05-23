# TapCard

A digital business card platform with NFC support. Users can create, customize, and share digital business cards; admins manage NFC cards, plans, and themes.

## Tech Stack

- **Backend:** Laravel (PHP) — REST API + Admin panel
- **Frontend:** Next.js 16 (React 19, TypeScript, Tailwind CSS v4)

## Project Structure

```
TapCard/
├── backend/    # Laravel API + Admin (NFC, Plans, Themes, Dashboard)
└── frontend/   # Next.js app (auth, dashboard, public card pages)
```

## Features

- User authentication (login / register)
- Business card creation and customization
- Lead capture
- Media uploads
- Public card pages (`/c/...`)
- Admin: NFC card management, subscription plans, themes, dashboard

## Getting Started

### Prerequisites

- PHP 8.2+ and Composer
- Node.js 18+ and npm
- MySQL (or compatible) database

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure DB credentials in .env, then:
php artisan migrate
php artisan serve
```

The API runs at `http://localhost:8000`.

### Frontend (Next.js)

```bash
cd frontend
npm install
# create .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

- `backend/.env` — copy from `.env.example` and fill in DB, app URL, mail, etc.
- `frontend/.env.local` — set API base URL for the backend.

## License

Private project.
