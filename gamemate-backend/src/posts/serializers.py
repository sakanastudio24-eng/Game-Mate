from rest_framework import serializers

from .models import Post


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
