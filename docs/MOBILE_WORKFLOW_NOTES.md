# Mobile Workflow Notes (Expo / React Native)

Last updated: 2026-02-28

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
