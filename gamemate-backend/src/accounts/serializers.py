from rest_framework import serializers

from .models import Profile, User


class ProfileSerializer(serializers.ModelSerializer):
    """Serialize public profile fields for account/me responses."""

    class Meta:
        model = Profile
        fields = ["display_name", "bio", "created_at"]


class MeSerializer(serializers.ModelSerializer):
    """Serialize authenticated user identity plus nested profile."""

    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "email", "username", "profile"]
