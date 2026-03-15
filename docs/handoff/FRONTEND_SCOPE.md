# Frontend Scope

Last updated: 2026-03-15

This is the current frontend scope that actually exists in the Expo app.

## Implemented

### Entry and Auth
- login screen for returning users
- 4-step onboarding for account creation
- onboarding draft persistence and restore
- session restore on cold launch
- single refresh attempt on expired access token
- clean sign-out when refresh fails

### Feed
- real backend feed loading
- explainability flow
- like, unlike, share, skip
- comments drawer UI
- search entry into video recommendation/search surface
- loading, empty, error, retry, and session-expired handling on main feed path

### Profile and Settings
- real profile fetch and update
- avatar selection
- favorite games persistence
- QR code generation and scan flow
- explicit settings child-route back targets
- account and notification settings routes

### Social and Messaging
- requests, friends, and threads surfaces
- send, accept, reject, and cancel request flows
- user search
- thread list, open thread, send message, unread update path

### Groups
- list, create, detail, discover
- join and leave
- member list
- invite and promote affordances
- owner/private handling on the frontend surface

### Infrastructure
- shared responsive layout tokens
- safe-area-aware action sheets and composers
- shared API helper and auth-aware request flow
- local cache and draft helpers where practical

## Deliberately Not Claimed As Finished

- full backend comment/reply product support
- heavy iOS validation coverage
- media upload pipeline
- realtime websocket messaging

## Canonical References

- [Delivery Status](/Users/zech/Downloads/The-Big-One/GameMate/docs/handoff/HANDOFF_STATUS.md)
- [App Flows](/Users/zech/Downloads/The-Big-One/GameMate/docs/flows/APP_FLOWS.md)
- [Backend API Contract](/Users/zech/Downloads/The-Big-One/GameMate/docs/backend/API_CONTRACT.md)
