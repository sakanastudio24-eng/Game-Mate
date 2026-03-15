from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from notifications.models import Notification


# Regression tests for notification read endpoints and ownership.
class NotificationReadTests(APITestCase):
    """Ensure users can only read-mark their own notifications."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="receiver@gamemate.dev",
            username="receiver",
            password="receiverpass123",
        )
        self.actor = User.objects.create_user(
            email="actor@gamemate.dev",
            username="actor",
            password="actorpass123",
        )
        self.other_user = User.objects.create_user(
            email="other@gamemate.dev",
            username="other",
            password="otherpass123",
        )

        self.notification = Notification.objects.create(
            user=self.user,
            actor=self.actor,
            type="message",
            is_read=False,
        )
        self.other_notification = Notification.objects.create(
            user=self.other_user,
            actor=self.actor,
            type="friend_request",
            is_read=False,
        )

    def test_notifications_list_includes_notification_id(self):
        """List payload should expose notification ids for follow-up actions."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/notifications/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], self.notification.id)

    def test_user_can_mark_owned_notification_read(self):
        """PATCH should mark a notification read when it belongs to requester."""
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(f"/api/notifications/{self.notification.id}/read/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_user_cannot_mark_another_users_notification_read(self):
        """PATCH should return 404 for notifications outside requester ownership."""
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(f"/api/notifications/{self.other_notification.id}/read/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.other_notification.refresh_from_db()
        self.assertFalse(self.other_notification.is_read)

    def test_user_can_mark_all_owned_notifications_read(self):
        """POST read-all should only update unread notifications for requester."""
        extra_notification = Notification.objects.create(
            user=self.user,
            actor=self.actor,
            type="share",
            is_read=False,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.post("/api/notifications/read-all/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["updated"], 2)
        self.notification.refresh_from_db()
        extra_notification.refresh_from_db()
        self.other_notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
        self.assertTrue(extra_notification.is_read)
        self.assertFalse(self.other_notification.is_read)
