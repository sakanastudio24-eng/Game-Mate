# GameMate Build Notes and Integration Status

Last updated: 2026-03-01

## 1) Build Status

- Runtime stack: Expo SDK 54 + React Native 0.81 + Expo Router 6
- Main tabs active: Feed, Groups, Social, Profile
- Hidden routes wired for detail/settings/utility screens in `app/(tabs)/_layout.tsx`
- TypeScript gate: `npx tsc --noEmit` passing

Platform status:
- Android: actively validated for current preview/build flows
- iOS: not tested due to limited capability in current environment

Primary build reference:
- `ANDROID_BUILD_GUIDE.md` (Android-first workflow)

## 2) Frontend Concerns Status

Resolved:
- Safe-area-aware layout for top/bottom controls across tab screens
- Back navigation helper behavior across nested contexts
- Feed interaction model with comments drawer and reply composer
- Group swipe interaction model:
  - swipe right to join
  - swipe left to pass
  - green/red side feedback during swipe
- Platform Connections settings surface added
- Recommendation search route added from feed header

Resolved in this update:
- Skeleton loading surfaces added for recommendation-driven UI:
  - `/(tabs)/ai-advisor` loading state now renders skeleton cards
  - Groups swipe modal loading state now renders skeleton placeholders
- Search UX upgraded in `/(tabs)/ai-advisor`:
  - video-first ranking model (top 2 AI picks + top 8 search results)
  - fixed search bar + infinite 2-column vertical grid
  - image-first cards with duration, metadata, and engagement stats
  - debounced search input, recent-search cache, category filter chips
  - continue surface for last search / last opened video
- Optimistic + local-cache interaction upgrades:
  - Feed likes now use optimistic toggle pattern with undo toast
  - Groups join actions now show undo toast and update instantly
  - Local cache hooks added for feed snapshot, likes/saves, group joins/deletes, and search context
- Share UX upgraded with copy-link fallback placeholder in feed and groups
- Global toast system added:
  - app-level `ToastProvider` wired in root layout
  - feed and groups migrated to `useToast()` for shared undo/action feedback
- Autocomplete suggestions added on video search using local sources (feed titles/authors/categories + recent searches)
- Android runtime input hardening:
  - shared Samsung-safe keyboard/input props applied across search + text entry surfaces
  - reduced pan-responder native gesture blocking in group swipe modal
- Onboarding hard validation:
  - DOB requires valid `MMDDYYYY`
  - DOB must be strictly before current day
  - success/error hint state added for DOB quality signal
- Settings + notifications:
  - Profile Settings now includes bottom Delete Account action with confirmation dialog
  - Notification Settings now supports presets, delivery flow mode, and time-sheet scheduling controls

Open follow-ups:
- Migrate additional list-heavy screens to skeleton loading when API wiring starts (messages, notifications, discover)
- Add visual regression checks for safe-area + skeleton states across device classes
- Validate cold-start persistence across Android/iOS device matrix (AsyncStorage package is installed in current workspace)
- Wire backend autocomplete to replace local suggestion fallback on `/(tabs)/ai-advisor`

## 3) Backend Endpoint Inventory (All v1 Endpoints)

Canonical contract: `docs/FLOWS_BACKEND.md`

### Auth and Account
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/social-login`
- `GET /api/me`
- `PATCH /api/me`
- `DELETE /api/me`
- `POST /api/users/password/change`
- `POST /api/users/email/send-verify`
- `POST /api/users/phone/verify`

### Preferences and Settings
- `GET /api/me/notifications`
- `PATCH /api/me/privacy`
- `PATCH /api/me/notifications`
- `GET /api/me/platform-connections`
- `PATCH /api/me/platform-connections`

### Feed
- `GET /api/posts`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/share`
- `POST /api/posts/:id/save`
- `POST /api/posts/:id/report`
- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`

### Groups
- `GET /api/groups`
- `GET /api/groups/discover`
- `POST /api/groups`
- `GET /api/groups/:id`
- `POST /api/groups/:id/join`
- `POST /api/groups/:id/leave`
- `POST /api/groups/:id/report`

### Recommendations (Search + Swipe)
- `POST /api/ai/recommendations`
- `POST /api/ai/video-recommendations`
- `POST /api/ai/suggested-tags`
- `GET /api/ai/autocomplete`
- `POST /api/ai/draft-intro`

### Social
- `GET /api/friends`
- `GET /api/friends/requests`
- `POST /api/friends/request/:userId`
- `POST /api/friends/accept/:userId`
- `POST /api/friends/reject/:userId`
- `GET /api/players/search`
- `GET /api/users/:userId`

### Messaging
- `GET /api/messages/conversations`
- `GET /api/messages/:userId`
- `POST /api/messages/:userId`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

### QR
- `GET /api/qr/my-code`
- `PATCH /api/qr/my-code`
- `GET /api/qr/scan?code=...`

## 4) Endpoint Handoff Notes

- Use a single JSON error envelope:
  - `{ error: { code, message, details?, requestId? } }`
- Use cursor pagination for feed/groups/messages lists
- Keep join/leave endpoints idempotent to tolerate repeated taps
- Recommendation APIs must be backend-first compatible and allow client fallback behavior
- Respect request constraints documented in:
  - `docs/AI_HANDOFF.md`
  - `docs/FLOWS_BACKEND.md`

## 5) Build and Validation Commands

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

## 6) Quick Routing Snapshot

Main tabs:
- `/(tabs)/news` (Feed)
- `/(tabs)/groups`
- `/(tabs)/social`
- `/(tabs)/profile`

Notable hidden routes currently in use:
- `/(tabs)/ai-advisor`
- `/(tabs)/group-detail`
- `/(tabs)/messages`
- `/(tabs)/settings`
- `/(tabs)/platform-connections`
- `/(tabs)/notification-settings`
- `/(tabs)/privacy-settings`
- `/(tabs)/qr-code`

## 7) Definition of Done for Backend Integration

- All endpoints above respond with documented v1 shapes
- Mobile app runs with `EXPO_PUBLIC_API_BASE_URL` and no schema errors
- Recommendation flows work with backend and local fallback
- Platform connections persist + reload correctly
- Error/rate-limit envelopes match the contract

## 8) Frontend Handoff

- Frontend implementation handoff checklist:
  - `docs/FRONTEND_HANDOFF_CHECKLIST.md`
- Frontend implementation status tracker:
  - `docs/FRONTEND_CHECKLIST_STATUS.md`
