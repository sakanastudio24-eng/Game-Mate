# Backend Overview

GameMate uses a Django + DRF backend with PostgreSQL, JWT auth, Celery/Redis support, and Sentry monitoring.

## Module Layout

- `accounts` custom user model, auth, profile, `/me`
- `posts` posts, interactions, feed APIs, ranking services
- `connections` request lifecycle and accepted relationships
- `messages` direct conversations, messages, unread state
- `groups` group entities, memberships, roles, permissions
- `notifications` user-scoped notification storage and read-state routes
- `activity` activity/event domain
- `core` shared services such as event guardrails
- `config` settings, URLs, exception handling, pagination

## Design Rules

- views handle HTTP concerns
- serializers validate and shape data
- services hold business logic where behavior gets non-trivial
- models enforce data constraints and relationships
- backend remains the source of truth for permissions and state consistency

## Explicit Scope Boundaries

- avatar and post media are URL-based only
- direct upload/storage/transcoding pipeline is intentionally out of scope
- no comment/reply backend is being presented as complete product scope yet

## Operational Notes

- JWT auth with refresh is the current mobile contract
- throttles exist on key auth and write paths
- Sentry is configured for backend monitoring
- Celery/Redis are available for async/event-driven behavior where configured
