from django.conf import settings
from django.core.cache import cache
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from messages.services.thread_service import get_or_create_direct_conversation


TEST_REST_FRAMEWORK = {
    **settings.REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {
        **settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"],
        "message_send": "1/min",
    },
}


@override_settings(REST_FRAMEWORK=TEST_REST_FRAMEWORK)
class MessageThrottleTests(APITestCase):
    """Ensure rapid message creation is throttled through the shared send path."""

    def setUp(self):
        cache.clear()
        self.sender = User.objects.create_user(
            email="message-sender@gamemate.dev",
            username="message_sender",
            password="senderpass123",
        )
        self.receiver = User.objects.create_user(
            email="message-receiver@gamemate.dev",
            username="message_receiver",
            password="receiverpass123",
        )
        self.conversation, _ = get_or_create_direct_conversation(self.sender, self.receiver.id)
        self.client.force_authenticate(user=self.sender)

    def test_send_message_is_throttled_after_limit(self):
        """Second rapid send should return a standard throttle response."""

        first_response = self.client.post(
            f"/api/messages/conversations/{self.conversation.id}/messages/send/",
            {"content": "First message"},
            format="json",
        )
        second_response = self.client.post(
            f"/api/messages/conversations/{self.conversation.id}/messages/send/",
            {"content": "Second message"},
            format="json",
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
