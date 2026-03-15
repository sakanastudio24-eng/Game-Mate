from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from posts.models import Post


# Permission regression tests for owner-only post mutations.
class PostOwnershipPermissionTests(APITestCase):
    """Ensure only the post creator can update or soft-delete a post."""

    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@gamemate.dev",
            username="owner",
            password="ownerpass123",
        )
        self.other_user = User.objects.create_user(
            email="other@gamemate.dev",
            username="other",
            password="otherpass123",
        )
        self.post = Post.objects.create(
            creator=self.owner,
            game="Apex Legends",
            title="Owner Post",
            description="Original description",
        )
        self.detail_url = f"/api/posts/{self.post.id}/"

    def test_non_owner_cannot_update_post(self):
        """PUT should return 403 when requester is not the creator."""
        self.client.force_authenticate(user=self.other_user)

        response = self.client.put(
            self.detail_url,
            {
                "game": "Apex Legends",
                "title": "Tampered Title",
                "description": "Tampered description",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Owner Post")

    def test_non_owner_cannot_partial_update_post(self):
        """PATCH should return 403 when requester is not the creator."""
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            self.detail_url,
            {"title": "Tampered Title"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Owner Post")

    def test_non_owner_cannot_soft_delete_post(self):
        """DELETE should return 403 and keep post active for non-owners."""
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.post.refresh_from_db()
        self.assertFalse(self.post.is_deleted)
        self.assertIsNone(self.post.deleted_at)

    def test_owner_can_partial_update_post(self):
        """PATCH should succeed for the creator."""
        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            self.detail_url,
            {"title": "Updated Title"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Updated Title")

    def test_owner_can_update_post(self):
        """PUT should succeed for the creator."""
        self.client.force_authenticate(user=self.owner)

        response = self.client.put(
            self.detail_url,
            {
                "game": "Valorant",
                "title": "Updated Title",
                "description": "Updated description",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, "Updated Title")
        self.assertEqual(self.post.game, "Valorant")

    def test_owner_can_soft_delete_post(self):
        """DELETE should soft-delete the post for the creator."""
        self.client.force_authenticate(user=self.owner)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertTrue(self.post.is_deleted)
        self.assertIsNotNone(self.post.deleted_at)
