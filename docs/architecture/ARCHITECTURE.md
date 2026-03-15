# Architecture Overview

## Current Runtime Model

GameMate is an Expo Router mobile app backed by a Django + DRF API.

Frontend runtime structure:
- `app/` holds route files and route groups
- `app/(tabs)/_layout.tsx` defines the tab shell and hidden child routes
- `src/context/AuthContext.tsx` owns session state, token restore, refresh, and expiry handling
- `services/` owns API calls and response normalization
- `src/lib/` holds navigation helpers, cached state hooks, design tokens, and content helpers
- `src/components/ui/` holds reusable screen, card, button, input, action-sheet, and header primitives

Backend runtime structure:
- `accounts` for auth, profile, `/me`, signup, login, refresh, logout
- `posts` for posts, feed, interactions, explainability, ranking services
- `connections` for request lifecycle and friend graph
- `messages` for direct conversations, messages, unread state
- `groups` for group entities, membership, and owner/admin actions
- `notifications` for user-scoped notifications and read-state mutations

## Navigation Model

GameMate no longer uses a flat screen-state machine. It uses Expo Router with a stable tab shell and stack-like child routes.

Top-level entry points:
- `/login`
- `/onboarding`
- `/(tabs)/news`
- `/(tabs)/groups`
- `/(tabs)/social`
- `/(tabs)/profile`

Navigation rules:
- tabs are stable anchors
- detail and edit routes are hidden child routes inside the tab shell
- explicit parent return targets are used where history is not trustworthy
- Android hardware back should pop real stack history first, then use an explicit fallback

## Data Flow

Frontend request flow:
1. screen calls a domain service from `services/`
2. service uses the shared API helper
3. helper sends bearer token if present
4. `401` triggers a single refresh attempt
5. refresh success retries once
6. refresh failure clears auth and routes to login

State model:
- auth/session state lives in `AuthContext`
- server-backed screen state is fetched per screen via services
- draft or UX-local state stays local to the relevant screen or helper hook
- onboarding progress is treated as local draft state until final completion succeeds

## Permission Model

Backend is the source of truth.

Frontend responsibilities:
- hide actions that are known to be unavailable
- render loading, empty, error, forbidden, and session-expired states distinctly
- never trust client-only assumptions for ownership or membership

Backend responsibilities:
- enforce post ownership on mutation
- enforce group owner/admin actions
- enforce conversation participant access
- reject unauthenticated access with consistent `401`
- reject forbidden access with consistent `403`

## Persistence Model

Persistent local state is used for recovery and UX continuity, not for replacing backend truth.

Used locally for:
- auth/session storage
- onboarding draft recovery
- selected local profile/feed UI state where useful
- recent searches and similar low-risk UX helpers

Not used as the primary source of truth for:
- permissions
- relationship state
- thread membership
- group roles

## Feed Architecture

The feed is backend-ranked and frontend-rendered.

Backend responsibilities:
- filter deleted content
- rank posts using interest, social, recency, and interaction signals
- provide explainability metadata

Frontend responsibilities:
- render loading, empty, error, and refreshed states cleanly
- keep local interaction state responsive
- preserve one clear content card model
- avoid leaking backend-only metadata into the visible card chrome

## Failure Model

GameMate distinguishes these states:
- loading
- empty
- retryable network/server failure
- forbidden
- session expired

This is deliberate. Network failure is not logout. Permission failure is not logout. Session expiry is only the auth-expired path.

## Scope Boundaries

Intentionally out of scope for this version:
- direct media upload pipeline
- realtime websocket stack
- comment system with full backend thread model
- group chat attachments and reactions
- multi-device session management dashboard
