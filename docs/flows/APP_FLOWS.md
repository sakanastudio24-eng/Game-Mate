# App Flows

## Global Rules

1. Navigation should behave like a stack of pages.
2. `goBack()` or real stack pop wins over synthetic route jumps.
3. When a parent is known, child screens should return to that parent explicitly.
4. Session expiry, offline state, empty state, and forbidden state are distinct UX states.

## Entry Flow

Logged out:
- `/login`
- `Create Account` -> `/onboarding`

Logged in:
- `/` redirects to `/(tabs)/news`

## Onboarding Flow

Current 4-step flow:
1. email
2. password
3. username + birthdate
4. preferences

Rules:
- email is not treated as invalid before the user actually enters invalid input
- password requirements are shown when the user starts interacting with password fields
- onboarding progress is saved locally as draft state
- onboarding completes only after signup, sign-in, and profile preference write succeed

## Feed Flow

Path:
- `Feed` -> `Video search` -> `Video preview`
- `Feed` -> `Creator profile`
- `Feed` -> `Comments drawer`
- `Feed` -> `More actions` / `Why this appeared`

Rules:
- search and explain actions must stay tappable above media layers
- comments composer must sit above Android system navigation
- back from creator profile returns to feed, not to a duplicated feed route

## Social and Messaging Flow

Path:
- `Social` -> `Search players`
- `Social` -> `Friend profile`
- `Social` -> `Messages`
- `Messages` -> `Chat`

Rules:
- friend and thread lists refresh on focus
- invalid thread access should fail cleanly
- unread state must stay consistent after send and read

## Groups Flow

Path:
- `Groups` -> `Create group`
- `Groups` -> `Discover groups`
- `Groups` -> `Group detail`
- `Group detail` -> `Member profile`

Rules:
- join/leave should refresh membership truth in detail and list surfaces
- owner-only actions should stay hidden or fail cleanly with permission messaging
- back from member profile should return to the originating group detail

## Profile and Settings Flow

Path:
- `Profile` -> tap avatar -> `Edit Profile`
- `Profile` -> `Settings`
- `Settings` -> nested settings screens
- `Profile` -> `QR Code`
- `QR Code` -> `User profile`

Rules:
- edit-profile back/cancel do not save drafts
- save is the only path that commits profile edits
- settings children return to settings, not feed
- QR/user-profile routes should use source context when returning

## Session Flow

Authenticated request:
1. make request
2. if `401`, refresh once
3. if refresh succeeds, retry once
4. if refresh fails, clear auth and route to login

Network failure:
- do not log the user out
- keep user in place
- show retry/offline state
