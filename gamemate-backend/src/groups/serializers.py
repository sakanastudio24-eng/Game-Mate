from rest_framework import serializers

from .models import Group, GroupMembership


class GroupSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    member_count = serializers.IntegerField(source="memberships.count", read_only=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "description",
            "is_private",
            "owner",
            "owner_email",
            "member_count",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "owner_email", "member_count", "created_at"]


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name", "description", "is_private"]

    def validate_name(self, value: str):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Group name must be at least 3 characters.")
        if len(value) > 255:
            raise serializers.ValidationError("Group name cannot exceed 255 characters.")
        return value

    def validate_description(self, value: str):
        value = value.strip()
        if len(value) > 1000:
            raise serializers.ValidationError("Description cannot exceed 1000 characters.")
        return value


class MembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["id", "user", "user_email", "role", "joined_at"]
        read_only_fields = ["id", "user", "user_email", "role", "joined_at"]


class GroupMembershipListSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["user_id", "email", "username", "role", "joined_at"]
