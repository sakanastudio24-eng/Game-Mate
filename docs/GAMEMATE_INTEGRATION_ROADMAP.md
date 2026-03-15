# GameMate Integration Roadmap

Last updated: 2026-03-15
Owner: Product integration pass (mobile + backend)

## Status Note (2026-03-15)
- Feed integration criteria are met:
  - real `/api/feed/` data renders
  - like/share/skip interactions wired
  - explain flow wired (`/api/feed/explain/{post_id}/`)
  - refresh + continuous scrolling behavior in place
- Profile integration criteria are largely met:
  - real profile read/update
  - persistence after relaunch
  - new-user empty states
  - onboarding preferences saved to backend profile
- Current focus has moved from broad integration into stabilization and proof flows.

## Current State

### Backend
Mostly built:
- auth
- groups
- posts
- feed
- profiles
- friends
- messages
- notifications
- explainable feed
- event systems
- observability

### Frontend Integration
Actually wired in major areas:
- login
- token persistence
- onboarding
- `/api/accounts/me/`
- `/api/profile/me/`
- `/api/feed/`
- groups list/create/detail
- social/messages/notifications primary screens

### Service Layer
Mostly exists, but not all screens use it yet.

Real gap:
- services exist
- screens are not fully connected

## Progress View
- Backend architecture: `95–100%`
- API wrapper/service layer: `85–90%`
- Screen integration: `70–80%`
- End-to-end product: `65–75%`

## Correct Next Phase
Do not build more backend first.

Execution direction:
- Integration
- Review
- Polish

## Phase 1 — Core Screen Integration
Goal: make the app feel real as fast as possible.

1. Auth + session review
- login
- token persistence
- logout
- expired token handling
- bad credential states

2. Profile integration
- profile read
- profile update
- favorite games
- bio/avatar/privacy

3. Feed integration
- feed list
- explain reason UI hook
- like/share/skip
- pull to refresh
- loading/empty/error states

4. Post creation
- create post screen
- optimistic refresh or feed reload
- validation errors

## Phase 2 — Social Integration
5. Friends / connections
- send request
- accept request
- friends list
- request states

6. Messaging
- thread list
- thread creation
- message send
- message history

7. Notifications
- fetch notifications
- unread state
- tap-through behavior

## Phase 3 — Group Completion
8. Group actions
- join
- leave
- member list
- invite
- promote
- ownership/permission handling

9. Group detail screen review
One screen should fully prove:
- read group
- see members
- join/leave logic
- owner-only actions
- empty/loading/error states

## Phase 4 — Review Pass
10. Full API review
For every screen:
- uses real API
- uses service layer
- handles loading
- handles empty state
- handles failure
- handles auth expiry

11. Response consistency review
Frontend parsing should consistently handle:
- `success`
- `count`
- `results`
- `data`
- `message`

12. Navigation review
- login -> home
- home -> feed
- profile -> edit
- feed -> profile
- notifications -> source screen
- group -> members
- friends -> messages

## Phase 5 — Product Proof Pass
Target: portfolio-ready, end-to-end flows.

Flow A — New user flow
- login
- hydrate account
- see feed
- open profile
- update interests

Flow B — Social flow
- send friend request
- accept
- message friend
- notification appears

Flow C — Content flow
- create post
- see it in feed
- like/share/skip
- verify explain endpoint behavior in UI

Flow D — Group flow
- create group
- join group
- invite/promote member

If these four flows work, the app is production-style for portfolio demonstration.

## Recommended Order
1. Profile integration
2. Feed integration
3. Post creation integration
4. Friends integration
5. Messaging integration
6. Notifications integration
7. Group advanced actions
8. Review pass
9. Portfolio proof flows
