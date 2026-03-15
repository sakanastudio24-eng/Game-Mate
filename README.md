# GameMate

GameMate is a mobile-first social gaming app with:
- Expo Router + React Native frontend
- Django + DRF backend
- JWT auth
- profile-driven feed recommendations
- groups, social connections, messaging, notifications, and QR profile discovery

## Current State

Frontend stack:
- Expo SDK 54
- React Native 0.81
- Expo Router 6
- TypeScript

Backend stack:
- Django
- Django REST Framework
- PostgreSQL
- SimpleJWT
- Sentry

Main tabs:
- `Feed`
- `Groups`
- `Social`
- `Profile`

Validation status:
- Android-first testing is active
- iOS coverage is thinner than Android
- `npx tsc --noEmit` is the current frontend type gate

## Product Areas Implemented

Auth and onboarding:
- email/password login
- 3-step account creation flow
- stronger username and password validation on the client
- onboarding game preferences saved into the backend profile after signup

Profile:
- real `/api/profile/me/` integration
- edit/save persistence
- favorite games stored in backend profile data
- QR code generation and scanning for user discovery

Feed:
- real `/api/feed/` integration
- explain flow
- like/share/skip actions
- loading, empty, and error states

Social:
- friend requests and friend list
- profile handoff from feed/social surfaces
- QR scan -> profile lookup flow

Messaging:
- thread list
- open thread
- send message

Groups:
- group list
- create group
- detail, join, and leave flows

Notifications:
- notification list
- backend mark-read support exists

## Project Structure

- `app/`
  - Expo Router routes, including auth and tab screens
- `services/`
  - API/domain clients used by screens
- `src/components/ui/`
  - shared UI primitives
- `src/context/`
  - auth/session state
- `src/lib/`
  - cache, navigation, QR parsing, responsive helpers, theme
- `docs/`
  - active flow, build, handoff, and roadmap notes
- `gamemate-backend/`
  - Django backend project

## Run Locally

```bash
npm install
npm run start
```

Set API base URL via env:

```bash
cp .env.example .env
# use your backend host (LAN IP for physical phone testing)
# EXPO_PUBLIC_API_URL=http://192.168.1.183:8000
```

Useful commands:

```bash
# Type check
npx tsc --noEmit

# Android embed gate
npx expo export:embed --eager --platform android --dev false

# EAS
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Scope Notes

- Auth is email/password only in the current product flow.
- Third-party auth providers are intentionally out of scope right now.
- Avatar and post media are URL-based only; upload/storage pipeline is out of scope.

## Persistence Note

`@react-native-async-storage/async-storage` is declared in `package.json` and used by cache hooks.
If dependency install fails in an offline shell, run `npm install` from an online environment to activate durable on-device persistence.

## Android Runtime Note

When using Expo Go performance overlays (draw-over-app), some Android devices can temporarily lock input/gesture behavior during app switch or swipe-away. Disable overlays before backgrounding and restart with `npx expo start -c` if it occurs.

## Documentation Index

- [Build Status](docs/BUILD_STATUS.md)
- [Android Build Guide](docs/ANDROID_BUILD_GUIDE.md)
- [Mobile Workflow Notes](docs/MOBILE_WORKFLOW_NOTES.md)
- [Integration Roadmap](docs/GAMEMATE_INTEGRATION_ROADMAP.md)
- [Guidelines](docs/GUIDELINES.md)
- [Attributions](docs/ATTRIBUTIONS.md)
- [Frontend Checklist Status](docs/FRONTEND_CHECKLIST_STATUS.md)
- [Frontend Handoff Checklist](docs/FRONTEND_HANDOFF_CHECKLIST.md)
- [Navigation Flows](docs/FLOWS.md)
- [Backend Contracts](docs/FLOWS_BACKEND.md)
- [Backend Implementation Notes](docs/BACKEND_IMPLEMENTATION_NOTES.md)
- [AI Handoff](docs/AI_HANDOFF.md)
- [Design System](docs/DESIGN_SYSTEM_MOBILE.md)
