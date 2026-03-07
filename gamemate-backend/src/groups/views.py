from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Group, GroupMembership
from .permissions import IsGroupMember, IsGroupOwner
from .serializers import GroupCreateSerializer, GroupMembershipListSerializer, GroupSerializer


class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Group.objects.all().select_related("owner")

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return GroupCreateSerializer
        return GroupSerializer

    def create(self, request, *args, **kwargs):
        serializer = GroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save(owner=request.user)
        return Response(
            GroupSerializer(group, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = GroupCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(GroupSerializer(group, context=self.get_serializer_context()).data)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        return (
            Group.objects.select_related("owner")
            .filter(
                Q(is_private=False) |
                Q(owner=user) |
                Q(memberships__user=user)
            )
            .distinct()
        )

    def get_permissions(self):
        perms = [IsAuthenticated()]
        if self.action in ["retrieve", "members"]:
            perms.append(IsGroupMember())
        if self.action in ["update", "partial_update", "destroy"]:
            perms.append(IsGroupOwner())
        return perms

    def get_object(self):
        # Keep explicit object-level permission enforcement for all detail actions.
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("Only the owner can delete this group.")
        instance.delete()

    @action(detail=True, methods=["post"], url_path="join")
    def join(self, request, pk=None):
        group = self.get_object()

        if group.is_private:
            return Response(
                {"message": "This group is private. Invite required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership, created = GroupMembership.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={"role": GroupMembership.ROLE_MEMBER},
        )

        if not created:
            return Response({"message": "Already a member."}, status=status.HTTP_200_OK)

        return Response({"message": "Joined."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="leave")
    def leave(self, request, pk=None):
        group = self.get_object()

        if group.owner_id == request.user.id:
            return Response(
                {"message": "Owner cannot leave their own group."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted, _ = GroupMembership.objects.filter(group=group, user=request.user).delete()
        if deleted == 0:
            return Response({"message": "Not a member."}, status=status.HTTP_200_OK)

        return Response({"message": "Group left."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="members")
    def members(self, request, pk=None):
        group = self.get_object()
        qs = GroupMembership.objects.filter(group=group).select_related("user").order_by("joined_at")
        return Response(GroupMembershipListSerializer(qs, many=True).data)
