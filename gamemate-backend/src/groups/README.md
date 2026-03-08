# `groups/` Folder Overview

Purpose: Group lifecycle, membership, and authorization rules.

## Responsibilities
- Manages `Group` and `GroupMembership` models.
- Enforces owner/member access rules for private/public groups.
- Provides group API endpoints for CRUD and member actions.
- Supports invite and promote flows.

## File map
- `models.py`: group and membership entities.
- `views.py`: `GroupViewSet` and custom actions (`join`, `leave`, `members`, `invite`, `promote`).
- `serializers.py`: read/write/member serializers and validation helpers.
- `serializers_invite.py`: invite request serializer.
- `permissions.py`: object-level membership/owner permissions.
- `signals.py`: owner membership bootstrap on group creation.
- `urls.py`: router registration for `/api/groups/...` routes.
- `admin.py`: admin views for groups and memberships.
- `migrations/`: schema history for group models.
