from rest_framework.permissions import BasePermission
from .models import GroupMembership


# Object-level permission: allow public groups and enforce membership for private groups.
class CanViewGroup(BasePermission):
    """
    Public groups: any authenticated user can view.
    Private groups: owner or member only.
    """

    def has_object_permission(self, request, view, obj):
        """Allow visibility based on privacy flag and requester membership."""
        if not obj.is_private:
            return True
        if obj.owner_id == request.user.id:
            return True
        return GroupMembership.objects.filter(group=obj, user=request.user).exists()


# Object-level permission: allow owner or member access.
class IsGroupMember(BasePermission):
    """
    Allow if user is the owner OR has a membership row for this group.
    """
    def has_object_permission(self, request, view, obj):
        """Allow access when requester owns the group or has a membership row."""
        if obj.owner_id == request.user.id:
            return True
        return GroupMembership.objects.filter(group=obj, user=request.user).exists()


# Object-level permission: allow only group owner access.
class IsGroupOwner(BasePermission):
    """
    Allow only if user is the owner.
    """
    def has_object_permission(self, request, view, obj):
        """Allow access only when requester is the group owner."""
        return obj.owner_id == request.user.id
