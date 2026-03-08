# `groups/migrations/` Folder Overview

Purpose: Schema history for group and membership models.

## Definition Notes
- Captures creation and constraints for `Group` and `GroupMembership`.
- Includes uniqueness constraints that prevent duplicate memberships.

## Migration Notes
- `0001_initial.py`: creates base group and membership models.
- `0002_...`: applies modern uniqueness constraint updates.
