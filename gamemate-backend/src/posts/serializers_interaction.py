from rest_framework import serializers

from .models import PostInteraction


# Serializer for post interaction API payloads.
class PostInteractionSerializer(serializers.ModelSerializer):
    """Serialize post interaction events for API responses."""

    class Meta:
        model = PostInteraction
        fields = [
            "id",
            "post",
            "interaction_type",
            "created_at",
        ]
        read_only_fields = ["created_at"]
