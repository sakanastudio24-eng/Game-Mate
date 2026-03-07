from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Group, GroupMembership
from .permissions import IsGroupMember, IsGroupOwner
from .serializers_invite import InviteSerializer
from .serializers import GroupCreateSerializer, GroupMembershipListSerializer, GroupSerializer

User = get_user_model()


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
            {
                "success": True,
                "data": GroupSerializer(group, context=self.get_serializer_context()).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = GroupCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(
            {
                "success": True,
                "data": GroupSerializer(group, context=self.get_serializer_context()).data,
            }
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = GroupSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)

        serializer = GroupSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        group = self.get_object()
        serializer = GroupSerializer(group, context=self.get_serializer_context())
        return Response({"success": True, "data": serializer.data})

    def get_queryset(self):
        user = self.request.user
        return (
            Group.objects.select_related("owner")
            .filter(
                Q(is_private=False)
                | Q(is_private=True, owner=user)
                | Q(is_private=True, memberships__user=user)
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Group deleted."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="join")
    def join(self, request, pk=None):
        group = self.get_object()

        if group.is_private:
            return Response(
                {"success": False, "message": "This group is private. Invite required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership, created = GroupMembership.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={"role": GroupMembership.ROLE_MEMBER},
        )

        if not created:
            return Response(
                {"success": True, "message": "Already a member."},
                status=status.HTTP_200_OK,
            )

        return Response({"success": True, "message": "Joined."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        group = self.get_object()

        membership = GroupMembership.objects.filter(
            group=group,
            user=request.user,
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a member."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if membership.role == "owner":
            return Response(
                {"detail": "Owner cannot leave their own group."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.delete()
        return Response(
            {"detail": "You left the group."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def invite(self, request, pk=None):
        group = self.get_object()

        if group.owner != request.user:
            return Response(
                {"detail": "Only the owner can invite users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = InviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["username"].strip()

        try:
            user = User.objects.get(Q(username=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if GroupMembership.objects.filter(group=group, user=user).exists():
            return Response(
                {"detail": "User already in group."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        GroupMembership.objects.create(
            group=group,
            user=user,
            role="member",
        )

        return Response({"detail": "User invited successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def promote(self, request, pk=None):
        group = self.get_object()

        if group.owner != request.user:
            return Response(
                {"detail": "Only owner can promote members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        username = request.data.get("username")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        membership = GroupMembership.objects.filter(
            group=group,
            user=user,
        ).first()

        if not membership:
            return Response(
                {"detail": "User not in group."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.role = "admin"
        membership.save()

        return Response({"detail": "User promoted to admin."})

    @action(detail=True, methods=["get"], url_path="members")
    def members(self, request, pk=None):
        group = self.get_object()
        qs = GroupMembership.objects.filter(group=group).select_related("user").order_by("joined_at")
        return Response(
            {"success": True, "results": GroupMembershipListSerializer(qs, many=True).data}
        )
