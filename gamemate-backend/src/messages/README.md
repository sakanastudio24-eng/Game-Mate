# Messages

Purpose:
- power 1-to-1 direct conversations, thread history, and unread state

Key models:
- `Conversation`
- `ConversationParticipant`
- `Message`

Key responsibilities:
- create or reuse direct conversations
- return inbox previews and message history
- send messages and mark threads as read
- enforce participant-only access to thread data

Notable files:
- `views.py`: conversation and message endpoints
- `services/thread_service.py`: conversation lookup and inbox shaping
- `services/message_service.py`: send/read message logic
- `throttles.py`: message send rate limit
