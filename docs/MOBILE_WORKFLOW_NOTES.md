# Mobile Workflow Notes (Expo / React Native)

Last updated: 2026-03-15

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

7. Onboarding validation gates
- Email and username validation should block invalid public identifiers early.
- Password validation should be stricter than minimum backend length for better client UX.
- Preference capture should save directly into backend profile data when the feed depends on it.

## 1.1) 2026-03-15 Checklist Execution Log

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

8. Android runtime hardening
- Added shared Android input compatibility props for Samsung keyboard/input stability.
- Added runtime docs note for Expo Go overlay lockups during app switching.

9. Auth and onboarding cleanup
- Login/onboarding now use email/password only.
- Third-party auth provider buttons are intentionally excluded from current product scope.
- Onboarding captures favorite games and writes them to `/api/profile/me/` after signup.

10. QR profile discovery
- QR payloads use an app-owned text format, not web URLs.
- Scanner validates QR format locally before routing.
- Backend profile lookup remains the source of truth for existence and permissions.

Still open:
- Cross-device cold-start persistence verification matrix (Android and iOS) after AsyncStorage install.
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

### Problem E: Onboarding drifted away from backend truth
- Symptom: signup UI and profile/feed personalization were disconnected.
- Root cause pattern: onboarding was simplified too far and stopped writing preferences into the real backend profile.
- Fix pattern: keep onboarding minimal, but preserve one preference step when backend feed ranking depends on it.
- Growth: onboarding is now treated as part of data integrity, not just marketing UI.

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

5. `docs/BUILD_STATUS.md`
- Keep Android status accurate and note iOS validation gaps clearly.

6. `docs/FRONTEND_CHECKLIST_STATUS.md`
- Keep component/hook checklist truthfully marked complete/partial/missing.

## 11) Current High-Value Rules

1. Email/password only means exactly that
- If auth providers are out of scope, remove them from the UI and the docs.

2. Onboarding should only keep steps that change backend truth
- Preferences that affect feed ranking belong in onboarding.
- Decorative or speculative preference steps do not.

3. QR profile discovery is app-specific, not URL-based
- Encode only a public identifier.
- Validate format before routing.
- Let the backend decide whether the target profile exists or is visible.

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

### Expo Go Overlay Caution (Android)

- Avoid leaving Expo Go performance overlays active while switching apps or swiping the app away.
- On some Android devices, overlay/draw-over-app behavior can cause temporary input and gesture lockups (keyboard does not type, app switch swipe appears stuck).
- If this occurs:
  1. Press Home and close Expo Go from recent apps.
  2. Disable the overlay/performance monitor display.
  3. Restart Metro with `npx expo start -c`.
  4. Reopen the app cleanly from Expo Go.

## 11) Platform Validation Note

- Android is the primary validated platform in this environment.
- iOS has not been fully tested in this environment due limited capability.

## 12) Performance Checklist Audit Snapshot (2026-03-01)

Scope audited: current Expo Router app under `app/` and shared modules under `src/`.

1. Stop re-render storms: **Good**
- `useMemo` and `useCallback` are used across high-traffic screens.
- Added memoized repeated row component (`GroupDiscoverCard` with `React.memo`).
- Group handlers are stabilized with `useCallback` to avoid churn through list rows.

2. Lists (FlatList-first): **Good**
- Groups discover surface moved from `ScrollView + map` to `FlatList`.
- Core list defaults now used on heavy surfaces:
  - `removeClippedSubviews`
  - `initialNumToRender`
  - `maxToRenderPerBatch`
  - `windowSize`
  - `updateCellsBatchingPeriod`
- Remaining `ScrollView` usage is for bounded/static forms/content, not long dynamic feeds.

3. Images performance: **Good**
- List-heavy media migrated to `expo-image` on Feed, Groups, Search, and Profile collections.
- `contentFit="cover"` and `cachePolicy="memory-disk"` applied on media surfaces.

4. Animation threading: **Good**
- Current animated paths use RN `Animated` with `useNativeDriver: true` on timing/spring flows.
- Motion accessibility (`Reduce Motion`) support is present.

5. Navigation/screen weight: **Good**
- Good: tab navigator is structured for lazy behavior and hidden routes.
- Added lazy mounting for heavy overlays/sheets so they are not mounted when closed.

6. Data fetching/cache/dedupe: **Good**
- Added in-memory TTL cache + in-flight request dedupe in `advisorClient`.
- Added `AbortSignal` support and abort-safe handling for stale request paths.
- Search refresh path now aborts stale requests on query changes.

7. Expensive effects during typing/scrolling: **Mostly good**
- Debounced search and memoized filtering/ranking are in place.
- Stale query requests are canceled instead of competing for state updates.
- Optional next step: defer non-urgent post-interaction work with `InteractionManager.runAfterInteractions()`.

8. Fonts/shadows/overlays cost: **Mostly good**
- Shadows are limited to a small set of surfaces; no widespread heavy shadow stacks.
- Overlay usage is present for feed readability and modal scrims; keep this bounded to avoid overdraw.

### 12.1) Measured Snapshot (Current)

- `React.memo` usages: `1` (heavy repeated row component added)
- `FlatList` usage count: `18`
- `FlatList` with `updateCellsBatchingPeriod`: `4`
- `ScrollView` usage count: `4` (non-feed bounded surfaces)

### 12.2) Remaining Optional Upgrades

1. Add `React.memo` for additional repeated cards on Profile tabs.
2. Add `getItemLayout` where row height is fixed for extra scroll performance.
3. Introduce TanStack Query when backend integration expands beyond current AI/search usage.

## 13) Frontend Handoff Checklist (Release/Backend Ready)

- Canonical checklist: `docs/FRONTEND_HANDOFF_CHECKLIST.md`
- Keep this checklist in sync with:
  1. `README.md`
  2. `docs/FLOWS.md`
  3. `docs/BUILD_STATUS.md`
  4. `docs/FRONTEND_CHECKLIST_STATUS.md`

## 14) Back Navigation Stack Rules (Required)

Use stack-first navigation behavior for all deep flows.

1. Core actions
- `router.push(...)`: open a new deep screen.
- `router.back()` / safe back helper: return to previous screen in stack.
- `router.navigate(...)`: jump to an existing route/tab when that is intentional.
- `router.replace(...)`: replace current route when avoiding duplicate loop entries.

2. Loop prevention
- Do not use `navigate("Feed")` as a generic back action from detail screens.
- Do not push the same route repeatedly just to go “back”.
- If a screen has no navigator history, use a deterministic fallback once.

3. Android hardware back behavior
- If `canGoBack()` is true: pop stack.
- If user is on a root route (Feed/Groups/Social/Profile/Login/Onboarding): let Android handle app exit (`return false`).
- Do not bounce between root tabs via custom history fallback on hardware back.

4. Required verification flows
- `Feed -> Post Detail -> Creator Profile -> Back -> Post Detail -> Back -> Feed`
- `Groups -> Group Detail -> Members -> Back -> Group Detail -> Back -> Groups`
- `Social -> Chat -> Back -> Social`
- `Profile -> Edit Profile -> Back -> Profile`

5. Pass criterion
- Three consecutive back presses should return user to where the flow started, without ping-pong between two screens.

## 15) Commit Protocol (Reviewed + Enforced)

This project follows commit practices that keep history easy to review, revert, and ship.

Source references used for this policy:
- Git docs (`git-commit`, `git-add`, `git-rebase`) and autosquash workflow
- Conventional Commits spec (`feat/fix/docs/chore/refactor/test`)

1. Atomic commit rule
- One commit = one behavior change.
- Never mix unrelated concerns in one commit (for example: feed UI + message API + docs).
- Use path-based staging, not blanket staging, when multiple tasks are in progress.

2. Required commit sequence per feature pass
- Commit 1: API/data model changes.
- Commit 2: UI wiring/state handling.
- Commit 3: regression fixups.
- Commit 4: docs/contracts/postmortem updates.

3. Message format
- Use `type(scope): imperative summary`.
- Examples:
  - `feat(feed): wire explain action modal for reason tags`
  - `fix(messages): prevent composer overlap with keyboard`
  - `docs(api): update conversation endpoints and payloads`

4. Pre-commit gate (must run each commit)
- `git status --short`
- `git diff --staged`
- Confirm only intended files are staged.
- Confirm message scope matches staged files.

5. Safe refinement workflow
- If a commit is incomplete but should be combined, create follow-up as:
  - `git commit --fixup=<sha>`
  - later: `git rebase -i --autosquash`
- Do not push messy “wip” history to shared branches.

6. Scope guardrails from this repo history
- Keep frontend navigation/back-button fixes isolated from backend messaging/refactor commits.
- Keep migrations in their own commit when possible.
- Keep docs and contracts in dedicated `docs(...)` commit unless they are tiny and tightly coupled.

7. Final check before push
- `git log --oneline -n 10`
- Verify commit order reads like a changelog (feature -> fix -> docs), not a mixed batch.
