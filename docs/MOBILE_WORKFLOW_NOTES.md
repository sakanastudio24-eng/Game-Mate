# Mobile Workflow Notes (Expo / React Native)

Last updated: 2026-03-01

## 1) Implementation Checklist (Working Preview Build)

Use this checklist before calling the preview build "ready":

1. Dependencies and SDK alignment
- Match Expo SDK, React Native, and React Navigation major versions.
- Run `npx expo install` for Expo-managed package alignment.
- Ensure no stale native-only modules block Gradle unless intentionally configured.

2. Android build gates
- Run `npx expo export:embed --eager --platform android --dev false`.
- If using EAS build, verify logs for AGP/Gradle/new architecture constraints.
- Confirm no package enforces unsupported architecture/runtime settings.

3. Runtime navigation
- Verify in-app back buttons return to previous screen context.
- Confirm nested navigator back works from hidden tab routes.
- Verify fallback back only triggers when there is no route history.

4. Feed UX gates
- Single-item vertical paging works.
- Infinite append works without item key collisions.
- Comments drawer supports vertical scroll and inline reply posting.

5. Safe area and device guards
- Verify top title/header is below notch/status bar on Android+iOS.
- Verify tab bar and bottom actions are not hidden under system nav.
- Verify touch targets remain >= 44pt (iOS) / 48dp (Android).

6. Profile UX gates
- Status picker updates online state consistently.
- Collection tabs (Videos/Games/Groups) all render and route correctly.
- Video preview cards are tappable and open preview route.

## 1.1) 2026-03-01 Checklist Execution Log

Completed this pass:
1. Skeleton loading system (expanded primitives)
- Added reusable `SkeletonAvatar`, `SkeletonLine`, and `SkeletonList`.
- Kept image-card skeletons on the video search surface.

2. Optimistic UI interactions
- Feed like toggle now applies instantly with undo toast.
- Group join now applies instantly with undo toast in groups list and swipe flow.

3. Offline snapshot cache (local save-state)
- Added `useLocalCache(key)` hook with storage fallback support.
- Cached feed snapshot, liked/saved IDs, group joined/deleted IDs, last-opened group, and search recents.

4. Premium search behavior
- Added debounced search on video search and groups search.
- Added recent searches list and clear action.
- Added reusable filter chips and wired category filters on video search.
- Added stronger empty state copy via reusable `EmptyState`.
- Added autocomplete suggestions from local feed titles/authors/categories and recent searches.

5. Continue surfaces
- Video search now shows continue chips for last search and last opened video.
- Groups now shows continue chip for last opened group.

6. Share UX
- Added copy-link fallback placeholder option in share menus (feed and groups), alongside existing share-sheet options.

7. Global feedback surface
- Added app-level `ToastProvider` and `useToast()` hook.
- Migrated feed and groups undo/action toasts to global host.

Still open:
- Real persistent storage package install completion in online environment (dependency now declared but install could not run in this offline sandbox).
- Backend-driven autocomplete suggestions.
- Full activity badge system, duplicate-group templates, and pull-to-refresh animation polish.

## 2) Postmortem: Problems and Growth

### Problem A: Build passed but runtime app failed
- Symptom: app closed on open, missing `main` registration error.
- Root cause pattern: Metro/project root mismatch or module load failure upstream.
- Fix pattern: restart Metro in correct project root and validate export/embed.
- Growth: now validating JS bundle generation as a required gate before runtime testing.

### Problem B: Android build failures from module/Gradle drift
- Symptom: Gradle task failures (`classifier`, `compileSdk`, reanimated/new architecture assertions).
- Root cause pattern: package versions/config mismatch against current Expo SDK and AGP.
- Fix pattern: align package versions to Expo SDK, remove incompatible modules temporarily, restore incrementally.
- Growth: dependency/version checks are now done before longer EAS runs.

### Problem C: In-app back behavior inconsistent
- Symptom: custom back sometimes jumped to home instead of previous page.
- Root cause pattern: back helper checked only one navigator scope.
- Fix pattern: walk parent navigators and goBack on first available history.
- Growth: back is treated as cross-navigator behavior, not single-screen behavior.

### Problem D: Feed interaction parity gaps
- Symptom: comments/controls not close to expected TikTok/Instagram interaction.
- Root cause pattern: static action sheet + non-threaded comments.
- Fix pattern: threaded drawer, inline reply composer, live append and count updates.
- Growth: social-feed interactions now modeled as stateful thread flows.

## 3) Optimization Log (Applied)

1. Feed rendering and UX
- Kept full-screen feed paging model with stable feed IDs.
- Added thread state map by feed item for comments.
- Added inline reply path with append and immediate UI feedback.
- Tuned comment thread `FlatList` virtualization (`initialNumToRender`, `maxToRenderPerBatch`, `windowSize`) and tap persistence for smoother long-thread interaction.

2. Navigation reliability
- Upgraded safe-back helper to traverse parent navigators.
- Reduced fallback-only behavior to true "no history" case.

3. UI consistency
- Unified current user avatar source across profile and feed replies.
- Added responsive offsets and safe-area aware placements for feed controls.

4. Profile media tooling
- Added premium tools row for videos (Upload/Studio/Drafts).
- Added tappable video preview route for per-video interaction.

## 4) Optimization Backlog (Next)

1. Feed performance
- Migrate heavy image surfaces to `expo-image` for better caching and decode path.
- Preload next/previous feed item media during scroll idle.
- Add viewability-driven playback state if video playback is introduced.

2. Thread scalability
- Paginate comments thread by cursor for larger datasets.
- Move reply posting to optimistic API workflow with rollback.

3. Device coverage
- Add runtime assertions for compact-height devices.
- Add screenshot-based visual checks for top/bottom safe area regressions.

4. Build hardening
- Add CI gate for `expo export:embed` and TypeScript.
- Add dependency drift check against Expo SDK lock.

## 5) Component Usage Pattern Notes (Pivot-Panel-Inspired, Mobile Adaptation)

Reference review date: 2026-02-28

Reviewed docs:
- https://mui.com/x/react-data-grid/components/pivot-panel/
- https://mui.com/x/react-data-grid/components/usage/
- https://mui.com/x/react-data-grid/pivoting/

Key takeaways from the reference pattern:
1. Trigger-first composition
- The Pivot Panel docs currently expose the trigger as the primary customizable part.
- Mobile mapping: keep entry points small and explicit (icon trigger in header/section actions), and move complexity into a panel/sheet.

2. Controlled vs uncontrolled state
- The Pivoting docs separate default `initialState` from controlled props (`pivotModel`, `pivotActive`, `pivotPanelOpen`).
- Mobile mapping: preserve a simple local default state for preview, but keep a controlled state shape ready for backend sync.

3. Accessibility requirement for icon triggers
- MUI requires text label or `aria-label` for trigger buttons.
- Mobile mapping: icon-only buttons must still carry `accessibilityLabel` and stable `accessibilityRole`.

4. Composable render/slot behavior
- Components usage emphasizes replacing trigger render while preserving behavior.
- Mobile mapping: keep trigger icon/button and panel body decoupled so each can be replaced without breaking open/close behavior.

## 6) Optimization Notes Applied to GameMate

1. Search and swipe entry points
- Feed search entry is icon-first and routes to a recommendation search surface.
- Group swipe entry uses a card icon, opening a focused swipe panel.

2. Panel interaction model
- Panel open/close is explicit state.
- Recommendation content remains independent from trigger visuals.
- Error/retry states are handled in-panel without leaving context.

3. Gesture-driven decisions
- Group card supports horizontal swipe with direct actions:
  - right swipe -> join
  - left swipe -> pass
- Side-screen glow feedback is mapped to intent:
  - right side green
  - left side red

4. Data contract stability
- Recommendation request/response types are centralized in `src/ai/advisorClient.ts`.
- Frontend uses backend-first fetch with local scoring fallback.

## 7) Optimization Backlog (Component Architecture)

1. Introduce a shared `PanelTrigger` primitive
- One component for icon trigger semantics, labels, and pressed states.
- Use across feed search, group swipe, and future settings panels.

2. Normalize panel state models
- Create shared state contracts:
  - `panelOpen`
  - `panelMode`
  - `panelData`
- This keeps route-level flows predictable and easier to test.

3. Add mobile panel performance guards
- Avoid heavy image decoding before panel open.
- Preload next swipe card image when current card settles.

4. Extend accessibility checks
- Add explicit QA checklist for icon-only triggers and gesture alternatives.
- Ensure every swipe action has button alternatives (join/pass).

## 8) Documentation Sync Contract (Required Per Feature Pass)

When any user-facing mobile flow changes, update these docs in the same pass:

1. `README.md`
- Keep runtime stack, tab names, and feature highlights current.

2. `docs/FLOWS.md`
- Keep route names, back behavior, and per-screen flow sequence accurate.

3. `docs/FLOWS_BACKEND.md`
- Keep endpoint matrix, payload shape, limits, and rate limits current.

4. `docs/AI_HANDOFF.md`
- Keep AI/search/autocomplete request+response contracts current.

5. `BUILD_STATUS.md`
- Keep Android status accurate and note iOS validation gaps clearly.

6. `docs/FRONTEND_CHECKLIST_STATUS.md`
- Keep component/hook checklist truthfully marked complete/partial/missing.

## 9) Offline Cache Guarantee Rule

- `useLocalCache` provides persistence only when `@react-native-async-storage/async-storage` is installed.
- If AsyncStorage is missing, cache falls back to memory-only and is not durable across cold restarts.
- Before declaring "guaranteed persistent offline cache", verify:
  1. `node_modules/@react-native-async-storage/async-storage` exists
  2. app restart preserves feed/groups/search snapshots
  3. no AsyncStorage missing warning appears in logs

## 10) Kill Instance + Port Recovery (Expo/Metro)

Use these when runtime instances hang or wrong Metro roots are running:

```bash
# Find running Expo/Metro processes
pgrep -af "expo|metro|react-native"

# Stop them
pkill -f "expo|metro|react-native"

# Check port ownership
lsof -n -iTCP:8081 -sTCP:LISTEN

# Restart clean
npx expo start -c
```

## 11) Platform Validation Note

- Android is the primary validated platform in this environment.
- iOS has not been fully tested in this environment due limited capability.
