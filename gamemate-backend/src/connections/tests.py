from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from connections.models import Connection


# Regression tests for request rejection, cancellation, and user search.
class ConnectionFlowTests(APITestCase):
    """Ensure pending connection transitions and search results stay consistent."""

    def setUp(self):
        self.sender = User.objects.create_user(
            email="sender@gamemate.dev",
            username="sender",
            password="senderpass123",
        )
        self.receiver = User.objects.create_user(
            email="receiver@gamemate.dev",
            username="receiver",
            password="receiverpass123",
        )
        self.third_user = User.objects.create_user(
            email="searchable@gamemate.dev",
            username="searchable",
            password="searchablepass123",
        )

    def test_receiver_can_reject_incoming_request(self):
        """Receiver should be able to reject one pending request."""
        connection = Connection.objects.create(sender=self.sender, receiver=self.receiver, status="pending")
        self.client.force_authenticate(user=self.receiver)

        response = self.client.post(f"/api/friends/request/{connection.id}/reject/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Connection.objects.filter(id=connection.id).exists())

    def test_sender_can_cancel_outgoing_request(self):
        """Sender should be able to cancel one pending outgoing request."""
        connection = Connection.objects.create(sender=self.sender, receiver=self.receiver, status="pending")
        self.client.force_authenticate(user=self.sender)

        response = self.client.post(f"/api/friends/request/{connection.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Connection.objects.filter(id=connection.id).exists())

    def test_reject_forbidden_for_non_receiver(self):
        """Reject should return 403 for users who do not own the receiver side."""
        connection = Connection.objects.create(sender=self.sender, receiver=self.receiver, status="pending")
        self.client.force_authenticate(user=self.sender)

        response = self.client.post(f"/api/friends/request/{connection.id}/reject/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Connection.objects.filter(id=connection.id).exists())

    def test_cancel_forbidden_for_non_sender(self):
        """Cancel should return 403 for users who do not own the sender side."""
        connection = Connection.objects.create(sender=self.sender, receiver=self.receiver, status="pending")
        self.client.force_authenticate(user=self.receiver)

        response = self.client.post(f"/api/friends/request/{connection.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Connection.objects.filter(id=connection.id).exists())

    def test_user_search_returns_relationship_state(self):
        """Search should return matching users and the current relationship state."""
        connection = Connection.objects.create(sender=self.sender, receiver=self.receiver, status="pending")
        self.client.force_authenticate(user=self.sender)

        response = self.client.get("/api/friends/search/?q=rece")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.receiver.id)
        self.assertEqual(response.data["results"][0]["relationship_status"], "outgoing_pending")
        self.assertEqual(response.data["results"][0]["connection_id"], connection.id)

    def test_user_search_excludes_self(self):
        """Search should not return the authenticated user in results."""
        self.client.force_authenticate(user=self.sender)

        response = self.client.get("/api/friends/search/?q=sender")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_reverse_pending_request_is_not_duplicated(self):
        """Send request should not create a second pending row in the opposite direction."""
        Connection.objects.create(sender=self.receiver, receiver=self.sender, status="pending")
        self.client.force_authenticate(user=self.sender)

        response = self.client.post(f"/api/friends/request/{self.receiver.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Incoming request already exists.")
        self.assertEqual(Connection.objects.count(), 1)
