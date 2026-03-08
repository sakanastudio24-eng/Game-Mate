from rest_framework import serializers

from .models import Connection


# Serializer for connection rows and request state.
class ConnectionSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source="sender.username", read_only=True)
    receiver = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Connection
        fields = "__all__"
