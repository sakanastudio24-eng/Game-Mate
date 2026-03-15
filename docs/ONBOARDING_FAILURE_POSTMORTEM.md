# Onboarding Failure Postmortem

## Problem

A failed network request during onboarding can force the user to re-enter information they already typed.

That is a trust failure and a workflow failure.

The app currently treats onboarding too much like a one-shot submit instead of a recoverable draft.

## Impact

If the request fails at the wrong time, the user can lose:

- selected username
- date of birth
- favorite games
- current onboarding step
- any partial setup progress

This is especially bad when the failure is caused by:

- poor network conditions
- app close/relaunch
- token expiry
- request timeout
- temporary backend error

## Root Cause

The onboarding flow submits data as part of account completion, but progress is not treated as durable draft state.

That means a transient failure can break continuity between:

1. what the user already entered
2. what the device remembers
3. what the backend actually stored

## Additional Issue: Android Keyboard Gap

### Problem

On Android, focusing the email field created a black gap at the bottom of the onboarding screen.

The gap did not exist before input focus, which made it look like a hidden footer or mystery navigation block even though no visible component owned that space.

### Root Cause

This was caused by Android keyboard avoidance resizing the onboarding root after the text field focused.

The screen was using `KeyboardAvoidingView` in a way that was appropriate for iOS but unstable for this Android layout.

### Fix

The onboarding screen now:

- disables `KeyboardAvoidingView` behavior on Android
- keeps keyboard avoidance only on iOS
- sets onboarding background color explicitly
- aligns Android navigation bar color with the onboarding background

### Rule

For this onboarding flow:

- no bottom gap should appear after focusing an input
- Android should not use keyboard avoidance that resizes the entire screen
- inline validation should stay next to the relevant field, not fall into the footer area

## Additional Issue: Settings Back Flow

### Problem

The back button in profile/settings routes could return to the feed instead of the profile path.

That breaks the expected stack behavior and makes the app feel unreliable.

### Root Cause

The settings stack was relying on generic history fallback behavior.

When history was thin, stale, or entered from a non-standard path, the fallback could resolve to feed instead of the intended parent screen.

### Fix

Settings-related screens now use explicit back targets:

- profile settings -> profile
- account settings -> settings
- notification settings -> settings
- privacy settings -> settings
- platform connections -> settings
- help -> settings
- privacy detail -> privacy settings

### Rule

Sensitive nested settings flows should not rely on generic history fallback.

When the intended parent screen is known, back navigation should use an explicit return target.

## Correct Product Rule

Onboarding should behave like a temporary draft until final completion succeeds.

That means:

- save progress locally as the user moves through the flow
- overwrite local draft state as fields change
- restore the last valid step after interruption
- submit the final payload only when finishing
- only mark onboarding complete after the final backend write succeeds
- only clear local draft after confirmed success

## Recommended Architecture

GameMate should use the simpler and safer onboarding model for now:

### Option Chosen

Save locally during onboarding, submit full payload at the end.

Flow:

1. user fills a step
2. app saves draft locally
3. user moves forward
4. app continues overwriting draft state as values change
5. final submit sends the full payload
6. if backend confirms success:
   - clear local draft
   - mark onboarding complete
7. if backend fails:
   - keep local draft
   - keep current step
   - allow retry

This keeps the implementation simple while preventing data loss.

## Draft State To Persist

Local onboarding draft should store:

- `email`
- `username`
- `birthdate`
- `favorite_games`
- `current_step`
- `updated_at`

If onboarding expands later, the draft can also include:

- `bio`
- `avatar_url`
- other preference fields

## Failure Handling Rules

### Network failure

Show:

`You're offline. Your progress is saved.`

Actions:

- `Retry`
- `Continue editing`

### Server error

Show:

`We couldn't finish setting up your account. Your progress is still saved on this device.`

Actions:

- `Retry`
- `Back`

### Auth/session expiry

Show:

`Your session expired. Your onboarding progress is saved. Sign in again to continue.`

Actions:

- `Sign In`

## State Model

The onboarding flow should be modeled as:

- `draft_onboarding_data`
- `current_step`
- `is_submitting`
- `submit_failed`
- `completed`

This is safer than a single `done/not-done` flag.

## Data Lifecycle Rule

Do not clear onboarding draft state on:

- network failure
- timeout
- app restart
- auth failure

Only clear onboarding draft state when:

- backend confirms successful completion
- user explicitly resets onboarding

## Expected UX

Good onboarding failure handling means:

- user does not lose progress
- failed submit does not force re-entry
- app can resume from the last saved step
- local draft survives interruption
- errors explain what happened and what the user can do next

## Implementation Target

For GameMate, this is the correct next behavior:

1. save onboarding draft locally after important field changes or step changes
2. restore onboarding draft on app reopen
3. submit the full payload on final completion
4. clear draft only after successful backend confirmation

## Done Looks Like

This issue is closed when all of the following are true:

- onboarding progress is restored after interruption
- favorite games and other entered values do not disappear on failure
- final submit can be retried without retyping
- onboarding completion is only marked after successful backend confirmation
- the user never has to start over because of a transient network failure
