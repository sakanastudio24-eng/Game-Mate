from rest_framework import serializers

from .models import Profile, User


# Serializer for profile fields returned in account APIs.
class ProfileSerializer(serializers.ModelSerializer):
    """Serialize public profile fields for account/me responses."""

    class Meta:
        model = Profile
        fields = ["display_name", "bio", "created_at"]


# Serializer for the authenticated user payload (`/api/accounts/me/`).
class MeSerializer(serializers.ModelSerializer):
    """Serialize authenticated user identity plus nested profile."""

    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "email", "username", "profile"]
