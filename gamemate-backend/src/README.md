# Backend Source Overview

This folder contains the Django backend used by GameMate.

Main sections:
- `accounts/`: auth, signup, login, logout, profile APIs, auth throttles
- `activity/`: durable activity logging and related service helpers
- `config/`: settings, URL routing, exception handling, pagination, WSGI/ASGI
- `connections/`: friend requests, friends list, request state transitions
- `core/`: shared service helpers used across apps
- `groups/`: group CRUD, membership, invites, promotions, owner/member permissions
- `messages/`: direct conversations, message history, unread state, thread list
- `notifications/`: notification records, list endpoint, mark-read endpoints
- `posts/`: post CRUD, feed, interactions, explainability, cache-aware services

Read each app-level `README.md` for the local purpose, key models, and endpoint notes.
