# Mobile Design System

## Purpose

This is the current mobile design-system note for GameMate. It documents the shared token and layout rules that matter for the Expo app as it exists now.

## Visual Direction

GameMate uses a dark-first product surface with warm accent color and high-contrast text.

Core intent:
- dark content surfaces for feed, social, groups, profile, and settings
- lighter onboarding surface to separate account creation from in-app browsing
- strong contrast on core actions and status indicators
- minimal visual noise on content cards

## Token Sources

Primary token modules:
- `src/lib/design-system.ts`
- `src/lib/responsive.ts`
- `src/lib/theme.ts`

Common consumers:
- `src/components/ui/Screen.tsx`
- `src/components/ui/Header.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/ActionSheet.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/Toast.tsx`

## Layout Rules

1. Respect safe areas at the top and bottom on every screen.
2. Buttons and icon taps must meet platform touch target minimums.
3. Bottom sheets and composers must sit above Android nav controls.
4. Validation text should stay attached to the field it belongs to.
5. Empty states should be visually lighter than error states.
6. Feed cards should prioritize title, creator identity, and action rail over backend metadata.

## Color Tokens

Core runtime color tokens now live in `src/lib/theme.ts`.

Primary product tokens:
- `colors.primary`
- `colors.onPrimary`
- `colors.background`
- `colors.surface`
- `colors.surfaceRaised`
- `colors.surfaceOverlay`
- `colors.surfaceInset`
- `colors.surfaceMuted`
- `colors.text`
- `colors.textSecondary`
- `colors.border`
- `colors.borderStrong`

State and accent tokens:
- `colors.online`
- `colors.away`
- `colors.busy`
- `colors.offline`
- `colors.info`
- `colors.highlight`
- `colors.destructive`

Rule:
- repeated dark-surface literals should not be introduced directly in screens when an existing theme token already covers the case
- action text/icons on orange buttons should use `colors.onPrimary`

## Typography Rules

Use responsive tokens instead of screen-local hardcoded sizes.

Hierarchy:
- screen title
- section title
- body
- secondary body
- caption/meta

Copy rules:
- keep action labels short
- use plain language in empty/error/session-expired states
- avoid debug or backend wording in user-facing strings

## Interaction Rules

- back and cancel should not silently save draft changes
- session-expired states should use one shared message and one clear action
- network failure should not be presented as logout
- repeated mutations should disable or guard duplicate taps
- action sheets should inherit safe-bottom padding from the shared component
- empty, error, and transient feedback surfaces should prefer shared primitives before screen-local reinvention

## Onboarding Rules

- no third-party auth buttons
- steps 1-3 should fit without scroll on a normal phone where possible
- preferences may scroll
- keyboard behavior must not create phantom black gaps or detached validation text
- onboarding draft progress must survive interruption until final success
- onboarding is allowed to stay visually lighter than the in-app dark surfaces, but it should still reuse shared accent/state semantics where practical

## Current Library Alignment

The design system is implemented through the current stack, not a design-only abstraction.

Relevant libraries:
- `react-native-paper`
- `react-native-safe-area-context`
- `expo-image`
- `react-native-reanimated`
- `@expo/vector-icons`

## Later Review Areas

This document is intentionally lean. Later review should focus on:
- spacing consistency across profile/settings/social screens
- stronger type scale consistency across cards and section headers
- motion consistency between tab changes, push transitions, and drawers
- formal color token naming once the visual system stops moving
