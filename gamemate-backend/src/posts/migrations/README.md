# `posts/migrations/` Folder Overview

Purpose: Schema history for feed post and interaction models.

## Definition Notes
- Tracks post content schema and engagement signal schema.
- Preserves data while evolving interaction model names/fields.

## Migration Notes
- `0001_initial.py`: creates `Post` and initial interaction model.
- `0002_interaction_to_postinteraction.py`: renames interaction model/field and applies final interaction constraints.
