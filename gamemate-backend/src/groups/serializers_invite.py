from rest_framework import serializers


class InviteSerializer(serializers.Serializer):
    """Validate invite target identifier submitted by owner invite flow."""

    username = serializers.CharField()
