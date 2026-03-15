from rest_framework import serializers

from .models import Post


def _validate_required_trimmed(value: str, *, field_name: str, max_length: int) -> str:
    """Normalize and validate required trimmed text content."""

    normalized = value.strip()
    if not normalized:
        raise serializers.ValidationError(f"{field_name} cannot be blank.")
    if len(normalized) > max_length:
        raise serializers.ValidationError(f"{field_name} cannot exceed {max_length} characters.")
    return normalized


# Serializer for feed post API payloads.
class PostSerializer(serializers.ModelSerializer):
    """Serialize feed post records for API responses."""

    # Use username explicitly so API output is stable even if User.__str__ changes.
    creator = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "creator",
            "game",
            "title",
            "description",
            "video_url",
            "created_at",
        ]

    def validate_game(self, value: str):
        """Reject blank or overlong game values after trimming whitespace."""
        return _validate_required_trimmed(value, field_name="Game", max_length=100)

    def validate_title(self, value: str):
        """Reject blank or overlong titles after trimming whitespace."""
        return _validate_required_trimmed(value, field_name="Title", max_length=255)

    def validate_description(self, value: str):
        """Reject whitespace-only or overlong descriptions while allowing real blanks."""
        normalized = value.strip()
        if value and not normalized:
            raise serializers.ValidationError("Description cannot be whitespace only.")
        if len(normalized) > 2000:
            raise serializers.ValidationError("Description cannot exceed 2000 characters.")
        return normalized

    def validate_video_url(self, value: str):
        """Trim optional URL input before default URL validation completes."""
        return value.strip()
