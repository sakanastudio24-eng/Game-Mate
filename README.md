# GameMate

GameMate is a mobile-first social gaming app built as a portfolio-scale full-stack project. It combines a React Native + Expo frontend with a Django REST backend to support account creation, profile-driven feed ranking, social connections, groups, messaging, notifications, and QR-based profile discovery.

## What It Does

GameMate currently supports:
- email/password signup, login, logout, and session restore
- 4-step onboarding with favorite game preferences saved into the user profile
- personalized feed loading from the backend
- post interactions: like, unlike, share, skip
- "Why this appeared" feed explanation flow
- profile view and profile editing
- social connections: requests, accept, reject, cancel, friends list, user search
- direct messaging: thread list, open thread, send message, unread handling
- groups: create, list, detail, join, leave, invite, promote
- notifications list with mark-read support
- QR profile sharing and QR profile scan lookup

## Tech Stack

Frontend:
- Expo SDK 54
- React Native 0.81
- Expo Router 6
- TypeScript
- React Native Paper

Backend:
- Django
- Django REST Framework
- PostgreSQL
- SimpleJWT
- Celery + Redis
- Sentry

## Repo Structure

This repo is a single-project workspace with the mobile frontend at the root and the backend in a dedicated subfolder.

```text
GameMate/
  app/                  Expo Router screens
  assets/               static app assets
  docs/                 active project docs, flows, handoff notes
  gamemate-backend/     Django + DRF backend
  services/             frontend API clients
  src/components/       shared UI components
  src/context/          auth/session context
  src/lib/              theme, cache, navigation, content, helpers
  README.md
```

## Screenshots / Demo

Screenshots and GIFs are not committed yet in this repo. The app is currently best reviewed by running it locally.

Demo account options:
- create a new account through the onboarding flow
- or create backend users directly in Django admin if you need seeded testing

## Local Setup

### 1. Frontend

Install dependencies:

```bash
npm install
```

Create your env file:

```bash
cp .env.example .env
```

For simulator/emulator:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

For a physical phone on the same Wi-Fi:

```env
EXPO_PUBLIC_API_URL=http://YOUR-MAC-LAN-IP:8000
```

Start Expo:

```bash
npx expo start -c
```

Useful frontend checks:

```bash
npx tsc --noEmit
npx expo export:embed --eager --platform android --dev false
```

### 2. Backend

From the backend folder:

```bash
cd gamemate-backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
cp -n .env.example .env
cd src
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Optional admin user:

```bash
python manage.py createsuperuser
```

If you are testing on a physical phone, keep the backend bound to `0.0.0.0:8000`, not `127.0.0.1:8000`.

## Environment Files

Committed examples:
- `.env.example`
- `gamemate-backend/.env.example`

Do not commit:
- `.env`
- `.env.local`
- backend secrets
- local SQLite files
- Python virtual environments

## Main App Areas

### Auth and Session
- signup, login, logout
- session restore on app reopen
- one refresh retry on expired access tokens
- clean sign-out when refresh fails

### Profile
- fetch `/api/profile/me/`
- edit bio, avatar selection, favorite games
- public profile lookup by username

### Feed
- fetch `/api/feed/`
- ranked items from backend
- explanation endpoint for why posts appear
- local UI state for likes, shares, skips, comments

### Social
- friend request lifecycle
- friend list
- search users
- QR profile lookup

### Messaging
- thread list
- open thread
- send message
- unread behavior

### Groups
- list groups
- create group
- group detail
- join / leave
- member list
- invite / promote

### Notifications
- list notifications
- mark one as read
- mark all as read

## API Summary

Core backend routes:

Auth:
- `POST /api/auth/signup/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`

Profile:
- `GET /api/accounts/me/`
- `GET /api/profile/me/`
- `PATCH /api/profile/me/`
- `GET /api/profile/{username}/`
- `GET /api/profile/{username}/posts/`

Feed / Posts:
- `GET /api/feed/`
- `GET /api/feed/explain/{post_id}/`
- `GET /api/posts/`
- `POST /api/posts/`
- `GET /api/posts/{id}/`
- `PATCH /api/posts/{id}/`
- `DELETE /api/posts/{id}/`
- `POST /api/posts/{id}/like/`
- `POST /api/posts/{id}/unlike/`
- `POST /api/posts/{id}/share/`
- `POST /api/posts/{id}/skip/`

Connections:
- `GET /api/connections/friends/`
- `GET /api/connections/requests/`
- `POST /api/connections/add/{user_id}/`
- `POST /api/connections/accept/{connection_id}/`
- `POST /api/friends/request/{id}/reject/`
- `POST /api/friends/request/{id}/cancel/`
- `GET /api/friends/search/?q=...`

Messages:
- `GET /api/messages/threads/`
- `POST /api/messages/thread/{user_id}/`
- `GET /api/messages/messages/{thread_id}/`
- `POST /api/messages/send/{thread_id}/`

Groups:
- `GET /api/groups/`
- `POST /api/groups/`
- `GET /api/groups/{id}/`
- `PATCH /api/groups/{id}/`
- `DELETE /api/groups/{id}/`
- `POST /api/groups/{id}/join/`
- `POST /api/groups/{id}/leave/`
- `GET /api/groups/{id}/members/`
- `POST /api/groups/{id}/invite/`
- `POST /api/groups/{id}/promote/`

Notifications:
- `GET /api/notifications/`
- `PATCH /api/notifications/{id}/read/`
- `POST /api/notifications/read-all/`

## Architecture Summary

Frontend:
- Expo Router drives app routing and screen structure
- `services/` holds request code and endpoint wrappers
- `src/context/AuthContext.tsx` owns session state
- `src/lib/` contains navigation helpers, local cache hooks, QR parsing, content seeds, and theme

Backend:
- app-per-domain Django layout: `accounts`, `posts`, `connections`, `messages`, `groups`, `notifications`
- DRF handles API serialization, validation, permissions, throttling, and pagination
- feed ranking lives in the posts service layer
- PostgreSQL is the source of truth

## Known Limitations

- screenshots/GIFs are not checked into the repo yet
- avatar and post media are URL-based only
- file upload/storage pipeline is intentionally out of scope in v1
- some screens still use mock presentation data around real integrations
- Android testing is stronger than iOS coverage right now
- this is not production-hardened for scale or app-store release yet

## Future Improvements

- add committed screenshots/GIFs for repo handoff
- replace remaining mock UI surfaces with full backend data
- add comments as a first-class backend model instead of preview-only UI replies
- broaden automated test coverage across frontend and backend
- add production deployment docs and hosted demo links
- add richer search, moderation, and analytics surfaces

## Handoff Docs

Key docs for deeper review:
- `docs/ARCHITECTURE.md`
- `docs/FLOWS.md`
- `docs/FLOWS_BACKEND.md`
- `docs/BUILD_STATUS.md`
- `docs/FRONTEND_HANDOFF_CHECKLIST.md`
- `docs/FEED_FLOW.md`

## Scope Boundary

GameMate is considered successful at this stage when:
- users can sign up and sign in
- users can edit a profile
- users can see and interact with a ranked feed
- users can connect, message, and join groups
- the repo is understandable and runnable by another developer

It is not trying to be infinitely scalable or feature-complete yet. The current goal is a clean, real, defensible v1 portfolio project.
