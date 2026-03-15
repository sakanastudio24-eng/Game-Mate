# Connections

Purpose:
- manage the friend request lifecycle and accepted friendships

Key model:
- `Connection`

Key responsibilities:
- send, accept, reject, and cancel requests
- list accepted friends and pending requests
- expose basic user search with relationship metadata
- prevent duplicate or self-directed requests

Notable files:
- `views.py`: connection state transitions and search endpoint
- `throttles.py`: friend request creation rate limit
- `serializers.py`: friend list payload shape
