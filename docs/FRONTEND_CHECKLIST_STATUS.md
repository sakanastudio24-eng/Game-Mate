# Frontend Checklist Status

Last updated: 2026-03-15

## Completed

1. Skeleton primitives and loading states
- `SkeletonAvatar`, `SkeletonLine`, `SkeletonList` available.
- Search/feed/group recommendation surfaces render skeletons instead of blank states.

2. Optimistic interactions
- Feed likes update instantly with undo toast.
- Groups join actions (list + swipe modal) update instantly with undo toast.

3. Local cache foundation
- `useLocalCache(key)` implemented.
- Applied to feed snapshot state, likes/saves, group joins/deletes, recent searches, and continue surfaces.
- AsyncStorage package is installed in workspace.

4. Search UX upgrades
- Debounced query input on heavy search surfaces.
- Recent-search list + clear action.
- Local autocomplete suggestions (titles/authors/categories/recents).
- Filter chips + stronger empty/error state presentation.

5. Global feedback architecture
- Global `ToastProvider` wired at app root.
- Feed and groups migrated to shared toast actions.

6. Back behavior reliability
- `useSafeBackNavigation()` is route-aware and parent-aware.
- Back buttons now prefer real stack history before fallback route mapping.

7. Android runtime hardening
- Shared `androidKeyboardCompatProps` applied across text/search inputs.
- Group swipe pan-responder tuned to reduce native-gesture blocking.
- Expo Go overlay lockup caveat documented in Android guides.

8. Onboarding flow hardening
- Email/password signup only.
- 3-step flow: identity -> security -> preferences.
- Username validation tightened.
- Password validation tightened.
- Favorite games from onboarding are saved into the backend profile.

9. Settings safety actions
- Profile Settings includes bottom `Delete Account` action.
- Confirmation dialog (`Are you sure?`) is required before destructive action.

10. Notification control model
- Added preset profile controls (`minimal`, `balanced`, `all`).
- Added delivery flow modes (`instant`, `batch_30m`, `hourly_digest`).
- Added time-sheet controls with quiet-hours presets and per-day active selection.

## Partially Complete

1. Offline cache durability verification
- AsyncStorage-backed hook path exists and package is installed.
- Cross-device cold-restart validation matrix is still pending.

2. Toast migration breadth
- Shared toast is in place, but some screens still use non-toast local feedback patterns.

3. Backend wiring for new settings controls
- Delete account and notification presets are still frontend-preview behavior until API wiring is completed.

## Not Complete (Planned)

1. Global activity badges (`Active today`, `New`, `Last updated`).
2. Pull-to-refresh motion polish on all list-heavy screens.
3. Duplicate group settings/template picker flow.
4. Full shared `useOptimisticToggle()` adoption across every toggle interaction.

## Canonical Handoff

- Delivery checklist: `docs/FRONTEND_HANDOFF_CHECKLIST.md`
- Runtime/build status: `docs/BUILD_STATUS.md`
- Navigation contracts: `docs/FLOWS.md`
