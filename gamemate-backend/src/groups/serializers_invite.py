from rest_framework import serializers


# Serializer for invite payload target identifier.
class InviteSerializer(serializers.Serializer):
    """Validate invite target identifier submitted by owner invite flow."""

    username = serializers.CharField()
