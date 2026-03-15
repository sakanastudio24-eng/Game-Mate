# Delivery Status

Last updated: 2026-03-15

This replaces the old roadmap, frontend checklist status, frontend handoff checklist, and build-status overlap. The goal here is to show what is done, what is partial, and what still needs proof.

## Backend Status

Green:
- auth
- profiles
- posts and feed
- connections request lifecycle
- direct messaging
- groups
- notifications read state
- ownership and permission enforcement on critical routes
- signup throttling

Strong partial:
- interactions, because full comment backend support is still not the current scope
- rate limiting, because core write paths are covered but not every possible noisy mutation

Scoped out:
- media upload pipeline

## Frontend Status

Implemented:
- login, logout, session restore, single-refresh expiry handling
- 4-step onboarding with local draft recovery
- profile read and edit flow
- feed load, explain flow, like/unlike/share/skip
- social request flow and search
- messages thread list, open thread, send message
- groups browse/create/detail/join/leave/member list
- notifications list and read actions
- QR share and scan profile flow
- explicit back handling for sensitive child routes

## Current Proof Level

Proven enough to demo:
- new user can sign up and enter the app
- existing user can log in and restore session
- profile can be edited and recovered after relaunch
- feed can load and interactions can be exercised
- friend request lifecycle exists end-to-end
- direct messaging exists end-to-end
- groups loop exists end-to-end

Still worth manual proof passes:
- full session-expiry matrix across every major screen
- broader iOS device validation
- final group owner-action QA
- final post creation proof flow

## Build and Runtime Status

Current runtime:
- Expo SDK 54
- React Native 0.81
- Expo Router 6
- Django 6 + DRF backend

Primary checks:
- `npx tsc --noEmit`
- `npx expo export:embed --eager --platform android --dev false`
- backend migrations on a fresh database

## Release Readiness Checklist

Done:
- repo has one root README
- docs are grouped by concern under `docs/`
- backend contracts live under `docs/backend/`
- redundant roadmap/status docs are removed
- postmortems are consolidated into one document

Still missing for a polished public handoff:
- screenshots or GIFs in README
- optional demo credentials
- final docs pruning after the last UX patch pass
