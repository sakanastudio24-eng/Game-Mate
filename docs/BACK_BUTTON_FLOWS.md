# Back Button Flows (GameMate)

Last updated: 2026-03-13

## Goal

Back navigation must behave like a stack pop, not a route loop.

## Core Rules

1. `push` for deep navigation
- Use `router.push(...)` to open details from list/timeline screens.

2. `back` to return
- Use `router.back()` (or shared safe-back helper) to return to the previous screen.

3. `navigate` only for intentional jumps
- Use `router.navigate(...)` when switching to an existing tab/screen, not as a generic back action.

4. `replace` for fallback recovery
- Use `router.replace(...)` when there is no stack history and fallback routing is needed.

5. Android root behavior
- On root routes, hardware back should exit app (default Android behavior), not cycle through tabs.

## Expected Stack Behavior

### Feed flow

- Path:
  - `Feed -> Post Detail -> Creator Profile`
- Back presses:
  - `Creator Profile -> Post Detail`
  - `Post Detail -> Feed`

### Groups flow

- Path:
  - `Groups -> Group Detail -> Members`
- Back presses:
  - `Members -> Group Detail`
  - `Group Detail -> Groups`

### Social flow

- Path:
  - `Social -> Chat`
- Back press:
  - `Chat -> Social`

### Profile flow

- Path:
  - `Profile -> Edit Profile`
- Back press:
  - `Edit Profile -> Profile`

## Manual Test Matrix

1. Header back (deep flow)
- Open `Feed -> Post Detail -> Creator Profile`.
- Tap header back twice.
- Expect return to `Feed` without visiting unrelated screens.

2. Android hardware back (deep flow)
- Open `Groups -> Group Detail`.
- Press Android back.
- Expect return to `Groups`.

3. Android hardware back (root flow)
- Go to root tab (`Feed`, `Groups`, `Social`, or `Profile`).
- Press Android back.
- Expect app/system exit behavior (no internal tab bounce loop).

4. No ping-pong rule
- Repeated back presses must not alternate between two screens.

## Failure Signs

- `Feed -> Profile -> Feed -> Profile` oscillation on back.
- Hardware back on root tabs moves between tabs instead of exiting.
- Back action jumps to unrelated screens that were not part of the current stack path.
