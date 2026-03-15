from rest_framework.permissions import BasePermission


# Object-level permission for post mutations owned by the creator only.
class IsPostOwner(BasePermission):
    """Allow write/delete access only to the user who created the post."""

    def has_object_permission(self, request, view, obj):
        """Return True when requester owns the target post."""
        return obj.creator_id == request.user.id
