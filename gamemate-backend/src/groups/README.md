# `groups/` Folder Overview

Purpose: Group lifecycle, membership, and authorization rules.

## Definition Notes
- Manages group ownership and membership roles.
- Enforces public/private visibility and owner-only destructive actions.
- Hosts join/leave/members/invite/promote endpoints.
- Contains validation helpers and object-level permission classes.

## Class Notes
- `Group` (`models.py`): core group entity (`owner`, `is_private`, metadata).
- `GroupMembership` (`models.py`): join table with role (`owner/admin/member`).
- `IsGroupMember` (`permissions.py`): object permission for owner/member access.
- `IsGroupOwner` (`permissions.py`): object permission for owner-only actions.
- `GroupOwnerSerializer` (`serializers.py`): compact owner payload in group responses.
- `GroupSerializer` (`serializers.py`): read serializer for group payloads.
- `GroupCreateSerializer` (`serializers.py`): write serializer for create/update operations.
- `MembershipSerializer` (`serializers.py`): single membership payload serializer.
- `GroupMembershipListSerializer` (`serializers.py`): members list serializer.
- `InviteSerializer` (`serializers_invite.py`): validates invite target identifier.
- `GroupViewSet` (`views.py`): groups CRUD + membership actions + permissions orchestration.
- `GroupsConfig` (`apps.py`): app boot config; loads signals on startup.

## Function Notes
- `_validate_group_name(...)` (`serializers.py`): shared name normalization + bounds checks.
- `_validate_group_description(...)` (`serializers.py`): shared description normalization + bounds checks.
- `add_owner_membership(...)` (`signals.py`): auto-adds owner as membership when group is created.

## File map
- `models.py`, `permissions.py`, `serializers.py`, `serializers_invite.py`, `views.py`, `urls.py`, `admin.py`, `signals.py`, `migrations/`.
