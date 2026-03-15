# GameMate Build Notes and Integration Status

Last updated: 2026-03-15

## 1) Build Status

- Runtime stack: Expo SDK 54 + React Native 0.81 + Expo Router 6
- Main tabs active: Feed, Groups, Social, Profile
- Hidden routes wired for detail/settings/utility screens in `app/(tabs)/_layout.tsx`
- TypeScript gate: `npx tsc --noEmit` passing

Platform status:
- Android: actively validated for current preview/build flows
- iOS: not tested as broadly in this environment

Primary build reference:
- `docs/ANDROID_BUILD_GUIDE.md`

## 2) Frontend Concerns Status

Resolved:
- Safe-area-aware layout for top/bottom controls across tab screens
- Back navigation helper behavior across nested contexts
- Feed interaction model with comments drawer and reply composer
- Group swipe interaction model with join/pass intent feedback
- Real profile integration with persistent edit/save flow
- Session-expired handling normalized across major screens
- Social/messages/notifications refresh on focus
- QR code profile share + scan flow

Resolved in the latest pass:
- Onboarding is now email/password only
- Third-party auth providers are intentionally removed from the product flow
- Onboarding uses a real 3-step structure:
  - identity
  - security
  - preferences
- Favorite games selected during onboarding are saved into `/api/profile/me/`

Open follow-ups:
- Full auth/session regression pass across all screens
- Post creation end-to-end proof pass
- Final group owner-action QA
- iOS device validation remains thinner than Android

## 3) Backend Endpoint Snapshot Used by Mobile

Auth and account:
- `POST /api/auth/signup/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`
- `GET /api/accounts/me/`
- `GET /api/profile/me/`
- `PATCH /api/profile/me/`

Feed:
- `GET /api/feed/`
- `GET /api/feed/explain/{post_id}/`
- `GET /api/posts/`
- `POST /api/posts/`
- `POST /api/posts/{id}/like/`
- `POST /api/posts/{id}/unlike/`
- `POST /api/posts/{id}/share/`
- `POST /api/posts/{id}/skip/`

Groups:
- `GET /api/groups/`
- `POST /api/groups/`
- `GET /api/groups/{id}/`
- `POST /api/groups/{id}/join/`
- `POST /api/groups/{id}/leave/`
- `GET /api/groups/{id}/members/`

Social and messaging:
- `GET /api/friends/`
- `GET /api/friends/requests/`
- `POST /api/friends/request/{user_id}/`
- `POST /api/friends/request/{connection_id}/accept/`
- `POST /api/friends/request/{connection_id}/reject/`
- `POST /api/friends/request/{connection_id}/cancel/`
- `GET /api/friends/search/?q=...`
- `GET /api/messages/conversations/`
- `POST /api/messages/conversations/direct/`
- `GET /api/messages/conversations/{conversation_id}/messages/`
- `POST /api/messages/conversations/{conversation_id}/messages/send/`

Notifications:
- `GET /api/notifications/`
- `PATCH /api/notifications/{id}/read/`
- `POST /api/notifications/read-all/`

QR:
- no backend QR endpoint is required
- app generates app-owned text payloads like `gm:user:zech`
- scanned payloads resolve through `GET /api/profile/{username}/`

## 4) Build and Validation Commands

```bash
# Local dev
npm install
npm start

# Type checks
npx tsc --noEmit

# Android bundle gate
npx expo export:embed --eager --platform android --dev false

# Android cloud builds
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## 5) Definition of Done for Current Mobile Pass

- real auth flow is stable
- onboarding writes preferences into backend profile data
- profile/feed/social/groups/messages/notifications use real APIs where already integrated
- QR profile discovery works without bypassing backend permissions
- build and type gates stay green
