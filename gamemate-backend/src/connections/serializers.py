from rest_framework import serializers

from .models import Connection


# Serializer for connection rows and request state.
class ConnectionSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    receiver = serializers.StringRelatedField()

    class Meta:
        model = Connection
        fields = "__all__"
