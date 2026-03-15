# GameMate

```text
 ▒██████   ▒█████  ▒███    ███ ███████      ▒███    ███  ▒█████  ▒███████ ███████
▒██       ▒██   ██ ▒████  ████ ██           ▒████  ████ ▒██   ██ ▒   ██   ██
▒██   ███ ▒███████ ▒██ ████ ██ █████        ▒██ ████ ██ ▒███████ ▒   ██   █████
▒██    ██ ▒██   ██ ▒██  ██  ██ ██           ▒██  ██  ██ ▒██   ██ ▒   ██   ██
 ▒██████  ▒██   ██ ▒██      ██ ███████      ▒██      ██ ▒██   ██ ▒   ██   ███████
```

GameMate is a mobile-first social gaming app built as a portfolio-scale full-stack project. The frontend is an Expo + React Native app that ships feed, social, groups, messaging, notifications, onboarding, and QR profile discovery. The backend is Django + DRF with JWT auth, profile-aware feed ranking, permissions, notifications, and throttled write paths.

## What It Does

GameMate currently supports:
- email/password signup, login, logout, session restore, and single-refresh expiry recovery
- 4-step onboarding with favorite game preferences saved into the backend profile
- personalized feed loading from the backend
- post interactions: like, unlike, share, skip
- explainability flow for why a feed item appeared
- profile view and profile editing
- social connections: request, accept, reject, cancel, friends list, user search
- direct messaging: thread list, open thread, send message, unread handling
- groups: create, list, detail, join, leave, invite, promote
- notifications list with mark-read support
- QR profile sharing and QR profile scan lookup

## Tech Stack

Frontend runtime:
- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router 6
- TypeScript

Frontend libraries used:
- `react-native-paper` for UI primitives and theming support
- `@expo/vector-icons` for iconography
- `@react-native-async-storage/async-storage` for local persistence
- `expo-secure-store` for sensitive local auth/onboarding data
- `expo-camera` for QR scanning
- `react-native-qrcode-svg` + `react-native-svg` for QR generation
- `expo-image` for media rendering and caching
- `react-native-safe-area-context` for device inset handling
- `react-native-gesture-handler` and `react-native-reanimated` for gesture and motion behavior
- `expo-system-ui`, `expo-status-bar`, and `expo-splash-screen` for system-level presentation
- `@sentry/react-native` for mobile error monitoring

Backend libraries used:
- Django 6
- Django REST Framework 3.16
- `djangorestframework-simplejwt` for JWT auth
- PostgreSQL via `psycopg`
- Celery + Redis for async/event work
- `django-cors-headers` for local client/backend integration
- `django-environ` for settings management
- `sentry-sdk` for error monitoring

## Repo Structure

```text
GameMate/
  app/                    Expo Router screens
  assets/                 static app assets
  docs/                   project docs grouped by concern
    architecture/
    backend/
    build/
    flows/
    handoff/
    postmortems/
    reference/
  gamemate-backend/       Django project code and env example
  services/               frontend API clients
  src/components/         shared UI components
  src/context/            auth/session context
  src/lib/                theme, cache, navigation, content, helpers
  README.md
```

## Local Setup

### Frontend

```bash
npm install
cp .env.example .env
```

Simulator/emulator API base URL:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Physical phone on the same Wi-Fi:

```env
EXPO_PUBLIC_API_URL=http://YOUR-MAC-LAN-IP:8000
```

Start Expo:

```bash
npx expo start -c
```

Useful frontend gates:

```bash
npx tsc --noEmit
npx expo export:embed --eager --platform android --dev false
```

### Backend

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

For phone testing, keep the backend on `0.0.0.0:8000`, not `127.0.0.1:8000`.

## Environment Files

Committed examples:
- `.env.example`
- `gamemate-backend/.env.example`

Do not commit:
- `.env`
- `.env.local`
- backend secrets
- Python virtual environments
- local SQLite files

## Main Product Areas

### Auth and Session
- signup, login, logout
- access-token refresh once on `401`
- clean sign-out when refresh fails
- onboarding draft persistence during interrupted setup

### Feed
- `GET /api/feed/`
- explanation endpoint for why content appears
- like, unlike, share, skip
- comment drawer UI and retry/error states

### Profile
- `GET /api/profile/me/`
- bio, avatar selection, favorite games
- public profile lookup by username or QR scan

### Social and Messaging
- friend request lifecycle
- friend list and search
- thread list, thread open, send message, unread behavior

### Groups
- list, create, detail
- join and leave
- member list
- invite and promote

### Notifications
- list notifications
- mark one read
- mark all read

## API Summary

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
- `PATCH /api/posts/{id}/`
- `DELETE /api/posts/{id}/`
- `POST /api/posts/{id}/like/`
- `POST /api/posts/{id}/unlike/`
- `POST /api/posts/{id}/share/`
- `POST /api/posts/{id}/skip/`

Connections / Messaging:
- `GET /api/connections/friends/`
- `GET /api/connections/requests/`
- `POST /api/friends/request/{user_id}/`
- `POST /api/friends/request/{connection_id}/accept/`
- `POST /api/friends/request/{connection_id}/reject/`
- `POST /api/friends/request/{connection_id}/cancel/`
- `GET /api/friends/search/?q=...`
- `GET /api/messages/conversations/`
- `POST /api/messages/conversations/`
- `GET /api/messages/conversations/{conversation_id}/messages/`
- `POST /api/messages/conversations/{conversation_id}/messages/`
- `POST /api/messages/conversations/{conversation_id}/read/`

Groups / Notifications:
- `GET /api/groups/`
- `POST /api/groups/`
- `GET /api/groups/{id}/`
- `POST /api/groups/{id}/join/`
- `POST /api/groups/{id}/leave/`
- `GET /api/groups/{id}/members/`
- `POST /api/groups/{id}/invite/`
- `POST /api/groups/{id}/promote/`
- `GET /api/notifications/`
- `PATCH /api/notifications/{id}/read/`
- `POST /api/notifications/read-all/`

## Architecture Summary

Frontend:
- Expo Router tab shell with hidden child routes for detail and settings flows
- shared auth/session context
- service-based API wrapper with token refresh + retry logic
- local persistence for onboarding drafts, feed state, and profile-adjacent UX state

Backend:
- Django app-per-domain layout (`accounts`, `posts`, `groups`, `connections`, `messages`, `notifications`)
- service-oriented business logic for feed ranking and messaging operations
- explicit permission checks for ownership, group roles, and conversation membership
- throttled auth and write paths

## Known Scope Boundaries

- avatar and post media are URL-based only
- media upload/storage/transcoding pipeline is intentionally out of scope
- Android is the primary validated mobile target for this pass
- iOS validation is lighter than Android validation
- screenshots and GIFs are not committed yet

## Future Improvements

- full comment/reply backend instead of feed-local comment drawer data
- stronger iOS validation pass
- richer analytics and delivery monitoring
- attachments, reactions, and read receipts for messaging
- broader abuse throttling across more write endpoints

## Docs Index

Core docs:
- [Architecture](/Users/zech/Downloads/The-Big-One/GameMate/docs/architecture/ARCHITECTURE.md)
- [Components](/Users/zech/Downloads/The-Big-One/GameMate/docs/architecture/COMPONENTS.md)
- [Design System](/Users/zech/Downloads/The-Big-One/GameMate/docs/architecture/DESIGN_SYSTEM.md)
- [App Flows](/Users/zech/Downloads/The-Big-One/GameMate/docs/flows/APP_FLOWS.md)
- [Feed Flow](/Users/zech/Downloads/The-Big-One/GameMate/docs/flows/FEED_FLOW.md)
- [Backend API Contract](/Users/zech/Downloads/The-Big-One/GameMate/docs/backend/API_CONTRACT.md)
- [Handoff Status](/Users/zech/Downloads/The-Big-One/GameMate/docs/handoff/HANDOFF_STATUS.md)
- [Postmortem](/Users/zech/Downloads/The-Big-One/GameMate/docs/postmortems/POSTMORTEM.md)

## Scope Boundary

This repo is meant to be a defensible portfolio-quality product build, not a fully scaled production deployment. The finish line is stable auth, profile, feed, social, messaging, groups, permissions, and consistent mobile UX, with a backend the frontend can rely on.
