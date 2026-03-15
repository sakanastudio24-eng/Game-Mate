# Component Boundaries

This document replaces the old screen-by-screen component dump. The goal is to explain what the current app is made of and where to extend it safely.

## Route Layer

Route files live in `app/`.

Entry routes:
- `app/index.tsx` auth-aware redirect
- `app/login.tsx` returning-user sign-in
- `app/onboarding.tsx` account creation and preference capture

Tab routes:
- `app/(tabs)/news.tsx`
- `app/(tabs)/groups.tsx`
- `app/(tabs)/social.tsx`
- `app/(tabs)/profile.tsx`

Hidden child routes:
- profile/settings/edit/detail routes
- group detail and create routes
- message list and thread routes
- QR code, user profile, search, video preview routes

Optimization rule:
- route files should compose existing UI primitives and services, not duplicate styling or API plumbing

## Shared UI Primitives

Core reusable UI lives under `src/components/ui/`.

Key primitives:
- `Screen` for safe-area-aware page layout
- `Header` for consistent title and back behavior
- `Button` for shared action styling and disabled/loading states
- `Input` for shared text entry behavior, including Android keyboard compatibility
- `Card` and `Chip` for repeated surface patterns
- `ActionSheet` for consistent bottom-sheet actions and safe bottom inset handling

Optimization notes:
- if a screen needs custom spacing, prefer extending token usage rather than hardcoding one-off values
- if a modal-like surface needs bottom actions, use the shared `ActionSheet` so Android nav overlap is handled once

## Context and Global Services

Global logic should stay small.

Current globals:
- `AuthContext` for auth lifecycle and session expiry handling
- API helper for request/refresh/retry behavior
- local cache helpers for durable UX state where appropriate

Optimization notes:
- do not add screen-specific business logic to `AuthContext`
- do not let route files own token refresh logic directly
- keep API response normalization in services, not screen JSX

## Screen-Specific Ownership

### Feed
- route owns rendering and view-state
- service owns data fetch
- helper owns local interaction/retry behavior where shared
- comments drawer and post actions should stay as local UI concerns unless backend comment support is expanded

### Social and Messaging
- social screen owns tabs/lists/filtering presentation
- message routes own thread rendering and send/read flow presentation
- backend remains the truth for threads, membership, and unread state

### Groups
- group list owns browse/create entry points
- group detail owns section tabs and owner/member affordances
- role-sensitive actions should stay hidden or disabled until backend state confirms permission

### Profile and Settings
- profile route owns public presentation of the signed-in user
- edit profile owns mutable draft state
- settings routes own nested preference and account controls
- explicit back targets matter more than generic history in this subtree

## What Was Removed From The Old Catalog

The previous `COMPONENTS.md` described:
- `App.tsx` as a screen router
- web-only `motion` wrappers
- separate onboarding screens that no longer exist
- obsolete component names and mock-only flows

That content was stale and misleading. The current app is route-based, token-driven, and split between service calls and reusable UI primitives.

## Safe Extension Rules

1. Add new routes under `app/` only when they are real screens.
2. Add shared UI only if two or more screens need the same behavior.
3. Put network logic in `services/`, not directly in reusable UI components.
4. Use explicit back targets for edit/create/settings flows where parent context is known.
5. Keep permission checks backend-first and render user-facing fallback states distinctly.
