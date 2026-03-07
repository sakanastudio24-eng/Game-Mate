# GameMate (Expo + React Native)

GameMate is a mobile-first social gaming app built with Expo Router and React Native.

## Current App Status (2026-03-01)

- Tabs: `Feed`, `Groups`, `Social`, `Profile`
- Platform focus: Android-first validation (iOS not fully tested in this environment)
- Type check gate: `npx tsc --noEmit` (passing)
- Runtime: Expo SDK 54 + RN 0.81 + Expo Router 6

## Key Implemented UX

- Feed
  - Full-screen vertical feed with infinite looping content
  - Comment drawer + inline replies
  - Save/share/report actions
  - Optimistic like toggle with undo toast

- Groups
  - Discover list, create group, detail screen
  - Swipe recommendation modal (right join / left pass)
  - Optimistic join with undo toast
  - Cached joined/deleted state and last-opened group

- Search (`/(tabs)/ai-advisor`)
  - Video-first ranking model
  - Top 2 AI picks + next 8 search results
  - Fixed search bar + 2-column infinite vertical grid
  - Debounced search, recents, filter chips, continue surface
  - Local autocomplete suggestions

- App-level UX foundation
  - Global toast provider
  - Reusable skeletons (`SkeletonAvatar`, `SkeletonLine`, `SkeletonList`)
  - Reusable `EmptyState`, `FilterChips`, `RecentSearchList`
  - Local cache hook for offline snapshot behavior
  - Android keyboard compatibility guards for Samsung-class IME behavior

- Onboarding validation
  - Date of birth input is strict `MMDDYYYY`
  - Date must be valid calendar date and strictly earlier than current day

## Project Structure

- Routes: `app/`
  - Main tabs and hidden routes in `app/(tabs)/`
- Shared UI: `src/components/ui/`
- App/data logic: `src/lib/`
- AI client contracts: `src/ai/advisorClient.ts`
- Documentation: `docs/`

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

### Useful Commands

```bash
# Type check
npx tsc --noEmit

# Android embed gate
npx expo export:embed --eager --platform android --dev false

# EAS
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Persistence Note

`@react-native-async-storage/async-storage` is declared in `package.json` and used by cache hooks.
If dependency install fails in an offline shell, run `npm install` from an online environment to activate durable on-device persistence.

## Android Runtime Note

When using Expo Go performance overlays (draw-over-app), some Android devices can temporarily lock input/gesture behavior during app switch or swipe-away. Disable overlays before backgrounding and restart with `npx expo start -c` if it occurs.

## Documentation Index

- [Build Status](docs/BUILD_STATUS.md)
- [Android Build Guide](docs/ANDROID_BUILD_GUIDE.md)
- [Mobile Workflow Notes](docs/MOBILE_WORKFLOW_NOTES.md)
- [Guidelines](docs/GUIDELINES.md)
- [Attributions](docs/ATTRIBUTIONS.md)
- [Frontend Checklist Status](docs/FRONTEND_CHECKLIST_STATUS.md)
- [Frontend Handoff Checklist](docs/FRONTEND_HANDOFF_CHECKLIST.md)
- [Frontend Scope](docs/FRONTEND_SCOPE.md)
- [Frontend Audit (2026-03-01)](docs/FRONTEND_AUDIT_2026-03-01.md)
- [Navigation Flows](docs/FLOWS.md)
- [Backend Contracts](docs/FLOWS_BACKEND.md)
- [Backend Implementation Notes](docs/BACKEND_IMPLEMENTATION_NOTES.md)
- [AI Handoff](docs/AI_HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN_SYSTEM_MOBILE.md)
