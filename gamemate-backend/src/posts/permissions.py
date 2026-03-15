from rest_framework.permissions import SAFE_METHODS, BasePermission


# Object-level permission for creator-owned post writes with safe-method reads allowed.
class IsOwnerOrReadOnly(BasePermission):
    """Allow reads to any authenticated requester and writes only to the creator."""

    def has_object_permission(self, request, view, obj):
        """Allow safe reads broadly and restrict mutations to the creator."""
        if request.method in SAFE_METHODS:
            return True
        return obj.creator_id == request.user.id
