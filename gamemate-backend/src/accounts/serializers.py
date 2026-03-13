from rest_framework import serializers

from .models import Profile, User


# Serializer for profile fields returned in account APIs.
class ProfileSerializer(serializers.ModelSerializer):
    """Serialize public profile fields for account/me responses."""

    def validate_favorite_games(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("favorite_games must be an array of strings.")

        normalized = []
        seen = set()
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError("favorite_games must contain strings only.")
            game = item.strip()
            if not game:
                continue
            game_key = game.lower()
            if game_key in seen:
                continue
            seen.add(game_key)
            normalized.append(game)

        if len(normalized) > 10:
            raise serializers.ValidationError("favorite_games supports up to 10 items.")

        return normalized

    class Meta:
        model = Profile
        fields = ["bio", "avatar_url", "favorite_games", "visibility"]


# Serializer for the authenticated user payload (`/api/accounts/me/`).
class MeSerializer(serializers.ModelSerializer):
    """Serialize authenticated user identity plus nested profile."""

    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "email", "username", "profile"]


class ProfileStatsSerializer(serializers.Serializer):
    """Serialize computed profile counters used by the public profile endpoint."""

    posts = serializers.IntegerField()
    friends = serializers.IntegerField()
    groups = serializers.IntegerField()


class PublicProfileSerializer(serializers.Serializer):
    """Serialize profile payload for `/api/profile/{username}` responses."""

    username = serializers.CharField()
    bio = serializers.CharField()
    avatar_url = serializers.CharField()
    favorite_games = serializers.ListField(child=serializers.CharField())
    visibility = serializers.CharField()
    stats = ProfileStatsSerializer()
