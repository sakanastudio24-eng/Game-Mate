# Mobile Design System (iPhone + Android)

This is the source of truth for GameMate layout and typography decisions in the Expo app.

## Goals

- Keep visual parity across iPhone and Android while respecting native platform metrics.
- Remove ad-hoc sizing from screens and use shared tokens.
- Guarantee safe-area correctness for top headers and bottom navigation controls.

## Token Source

Primary token hook:

- `src/lib/design-system.ts`

Adapter used by screens/components:

- `src/lib/responsive.ts`

## Platform Presets

### iPhone preset

- `horizontalPadding`: `18`
- `titleSize`: `36`
- `sectionTitleSize`: `22`
- `bodySize`: `15`
- `bodySmallSize`: `13`
- `captionSize`: `12`
- `cardRadius`: `20`
- `cardPadding`: `14`
- `headerTopSpacing`: `8`
- `headerTitleSize`: `19`
- `iconButtonSize`: `42`
- `tabBarBaseHeight`: `58`
- `tabBarLabelSize`: `12`
- `searchRadius`: `14`
- `safeBottomInset`: `10`
- `safeTopInset`: `10`

### Android preset

- `horizontalPadding`: `16`
- `titleSize`: `34`
- `sectionTitleSize`: `21`
- `bodySize`: `14`
- `bodySmallSize`: `12`
- `captionSize`: `11`
- `cardRadius`: `18`
- `cardPadding`: `12`
- `headerTopSpacing`: `6`
- `headerTitleSize`: `18`
- `iconButtonSize`: `40`
- `tabBarBaseHeight`: `60`
- `tabBarLabelSize`: `11`
- `searchRadius`: `12`
- `safeBottomInset`: `8`
- `safeTopInset`: `8`

## Size Modifiers

Tokens are scaled by screen width class in `useMobileDesignTokens()`:

- Tablet: `width >= 768`, scale `1.18`
- Compact phone: `width < 360`, scale `0.94`
- Regular phone: scale `1.0`

## Layout Rules

1. Top safe area:
- Use `Math.max(insets.top, responsive.safeTopInset) + responsive.headerTopSpacing` for major headers.

2. Bottom safe area:
- Use `Math.max(insets.bottom, responsive.safeBottomInset)` for tab bars and scroll/list bottom padding.

3. Content width:
- Use `responsive.contentMaxWidth` with centered layout blocks.

4. Horizontal rhythm:
- Use `responsive.horizontalPadding` for all screen content wrappers.

5. Card consistency:
- Use `responsive.cardRadius` and `responsive.cardPadding` on interactive cards.

6. Search and segmented controls:
- Use `responsive.searchRadius` and `responsive.bodySize/bodySmallSize` for field text.

## Typography Rules

1. Screen title: `responsive.titleSize`
2. Section title: `responsive.sectionTitleSize`
3. Body: `responsive.bodySize`
4. Secondary body: `responsive.bodySmallSize`
5. Meta/caption: `responsive.captionSize`

Recommended line-height multipliers:

- Display/title: `1.1 - 1.15`
- Body: `1.35 - 1.45`
- Caption: default or `1.2`

## Components Updated To This System

Core primitives:

- `src/lib/design-system.ts`
- `src/lib/responsive.ts`
- `src/components/ui/Screen.tsx`
- `src/components/ui/Header.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Chip.tsx`

Route coverage:

- All screens in `app/(tabs)` (except `index.tsx`, which is a redirect only route).
- `app/onboarding.tsx`

## Implementation Checklist For New Screens

1. Call `const responsive = useResponsive()` and `const insets = useSafeAreaInsets()`.
2. Compute:
- `safeTop`
- `safeBottom`
3. Apply `responsive.horizontalPadding` and `responsive.contentMaxWidth` to top-level content wrappers.
4. Use responsive typography token sizes instead of hardcoded text sizes.
5. Use responsive card radius/padding for all card-like surfaces.
6. Add bottom list/scroll padding using `safeBottom`.
7. Validate on:
- iPhone with home indicator
- Android with gesture nav
- Android with 3-button nav

## Runtime QA Pass

Before build handoff:

1. Preview in Expo Go on at least one iPhone and one Android device profile.
2. Confirm tab bar controls are not under system navigation controls.
3. Confirm no clipped header text under status bar/notch.
4. Confirm consistent card density between news, groups, social, and profile.
