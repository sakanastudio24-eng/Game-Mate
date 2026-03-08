from rest_framework import serializers

from .models import Group, GroupMembership


def _validate_group_name(value: str) -> str:
    """Normalize and validate group name bounds."""
    value = value.strip()
    if len(value) < 3:
        raise serializers.ValidationError("Group name must be at least 3 characters.")
    if len(value) > 80:
        raise serializers.ValidationError("Group name must be under 80 characters.")
    return value


def _validate_group_description(value: str) -> str:
    """Normalize and validate group description bounds."""
    value = value.strip()
    if len(value) > 500:
        raise serializers.ValidationError("Description must be under 500 characters.")
    return value


class GroupOwnerSerializer(serializers.Serializer):
    """Compact owner payload embedded in group responses."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)


class GroupSerializer(serializers.ModelSerializer):
    """Read serializer for full group payloads used in API responses."""

    owner = GroupOwnerSerializer(read_only=True)
    member_count = serializers.IntegerField(source="memberships.count", read_only=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "description",
            "is_private",
            "owner",
            "member_count",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "member_count", "created_at"]

    def validate_name(self, value: str):
        """Apply canonical group-name validation rules."""
        return _validate_group_name(value)

    def validate_description(self, value: str):
        """Apply canonical group-description validation rules."""
        return _validate_group_description(value)


class GroupCreateSerializer(serializers.ModelSerializer):
    """Write serializer for create/update/partial-update group actions."""

    class Meta:
        model = Group
        fields = ["name", "description", "is_private"]

    def validate_name(self, value: str):
        """Validate name before persisting new or updated group data."""
        return _validate_group_name(value)

    def validate_description(self, value: str):
        """Validate description before persisting new or updated group data."""
        return _validate_group_description(value)


class MembershipSerializer(serializers.ModelSerializer):
    """Serializer for membership details in direct membership endpoints."""

    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["id", "user", "user_email", "role", "joined_at"]
        read_only_fields = ["id", "user", "user_email", "role", "joined_at"]


class GroupMembershipListSerializer(serializers.ModelSerializer):
    """Serializer for group membership details shown in group member listings."""

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["user_id", "email", "username", "role", "joined_at"]
