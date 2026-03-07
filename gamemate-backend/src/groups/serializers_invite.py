from rest_framework import serializers


class InviteSerializer(serializers.Serializer):
    username = serializers.CharField()
