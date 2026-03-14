# Messaging System Outline (v1 Foundation)

## Scope

Build 1-to-1 messaging first, then expand:

1. User opens a conversation.
2. User sees message history.
3. User sends a message.
4. Unread count updates correctly.
5. Notifications can deep-link into the thread.

Later phases add:
- group chat
- attachments
- reactions
- typing indicators
- read receipts
- moderation tools

## v1 Data Model

Use these core entities:

### `Conversation`
- `id`
- `type` (`direct` | `group`)
- `created_at`
- `created_by`
- `last_message_id`
- `last_message_at`

### `ConversationParticipant`
- `id`
- `conversation_id`
- `user_id`
- `joined_at`
- `last_read_message_id` (or `last_read_at`)
- `is_muted`
- `is_archived`

### `Message`
- `id`
- `conversation_id`
- `sender_id`
- `body`
- `message_type` (`text` in v1)
- `created_at`
- `edited_at`
- `deleted_at` (soft delete)

### `Notification` (message events)
- `id`
- `user_id`
- `type` (`message`)
- `conversation_id`
- `message_id`
- `is_read`
- `created_at`

`MessageRead` is optional for v1 if per-message receipts are needed.  
For v1, `last_read_message_id` on `ConversationParticipant` is preferred (simpler + cheaper).

## API Shape (v1)

### Conversations
- `GET /api/messages/conversations/`
- `POST /api/messages/conversations/` (create or return existing direct conversation)

### Thread
- `GET /api/messages/conversations/{id}/messages/`
- `POST /api/messages/conversations/{id}/messages/`

### Read state
- `POST /api/messages/conversations/{id}/read/`

### Optional later
- `POST /api/messages/messages/{id}/edit/`
- `POST /api/messages/messages/{id}/delete/`

## Behavior Rules

1. No duplicate direct conversations
- For direct chat, sort both user IDs and reuse existing conversation if found.

2. Preserve history
- Never overwrite old messages.

3. Soft delete only
- Set `deleted_at`, keep row, render "message deleted" in UI.

4. Conversation list from latest message
- Show peer, last message preview, timestamp, unread badge.

5. Cheap read state
- Use `last_read_message_id` and compute unread as messages after that ID, excluding self-sent.

## Security Rules

- Auth required for all messaging endpoints.
- User must be participant to read/send in a conversation.
- Never trust client-provided membership.
- Throttle message send endpoint.
- Validate max message length.
- Sanitize output rendering in clients.
- Soft delete preferred over hard delete.
- Log abuse patterns.
- No custom auth/crypto logic in v1.

## Cache Rules

Database is source of truth. Cache is temporary acceleration only.

Cache candidates:
- unread counts
- conversation list previews (short TTL)

Invalidate on:
- new message
- thread read
- thread archive/mute changes

## UI Flow (v1)

1. Inbox screen:
- conversation list
- avatar/name
- last message preview
- unread badge
- timestamp

2. Thread screen:
- message bubbles
- send input
- loading/empty/error states

3. Open conversation from:
- friend profile
- friend list
- notification deep-link

## Delivery Order

Implement in this order:

1. Direct conversation create/reuse
2. Conversation list
3. Thread history fetch
4. Send message
5. Unread count
6. Mark as read
7. Notifications deep-link
8. Soft delete

## Non-Goals for v1

- Attachments
- Voice notes
- Reactions
- Typing indicators
- Presence/online status
- End-to-end encryption

These are intentionally deferred until the core messaging loop is stable.
