from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from posts.models import Post, PostInteraction


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


# Validation regression tests for post create payloads.
class PostValidationTests(APITestCase):
    """Ensure invalid create payloads fail with clear 400-level responses."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="poster@gamemate.dev",
            username="poster",
            password="posterpass123",
        )
        self.client.force_authenticate(user=self.user)
        self.create_url = "/api/posts/"

    def test_whitespace_only_title_is_rejected(self):
        """Whitespace-only titles should fail validation."""
        response = self.client.post(
            self.create_url,
            {
                "game": "Apex Legends",
                "title": "   ",
                "description": "Valid description",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data.get("errors", {}))

    def test_whitespace_only_description_is_rejected(self):
        """Whitespace-only descriptions should fail validation when supplied."""
        response = self.client.post(
            self.create_url,
            {
                "game": "Apex Legends",
                "title": "Valid title",
                "description": "   ",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("description", response.data.get("errors", {}))

    def test_overlong_title_is_rejected(self):
        """Titles exceeding the max length should fail cleanly."""
        response = self.client.post(
            self.create_url,
            {
                "game": "Apex Legends",
                "title": "T" * 256,
                "description": "Valid description",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data.get("errors", {}))

    def test_overlong_game_is_rejected(self):
        """Games exceeding the max length should fail cleanly."""
        response = self.client.post(
            self.create_url,
            {
                "game": "G" * 101,
                "title": "Valid title",
                "description": "Valid description",
                "video_url": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("game", response.data.get("errors", {}))


# Interaction reversal tests for like/unlike behavior.
class PostUnlikeTests(APITestCase):
    """Ensure like removal stays idempotent and count-safe."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="liker@gamemate.dev",
            username="liker",
            password="likerpass123",
        )
        self.owner = User.objects.create_user(
            email="creator@gamemate.dev",
            username="creator",
            password="creatorpass123",
        )
        self.post = Post.objects.create(
            creator=self.owner,
            game="Apex Legends",
            title="Ranked clip",
            description="Late game wipe",
        )
        self.like_url = f"/api/posts/{self.post.id}/like/"
        self.unlike_url = f"/api/posts/{self.post.id}/unlike/"
        self.client.force_authenticate(user=self.user)

    def test_user_can_remove_like_cleanly(self):
        """Unlike should delete the existing like record."""
        PostInteraction.objects.create(
            user=self.user,
            post=self.post,
            interaction_type="like",
        )

        response = self.client.post(self.unlike_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["data"]["removed"])
        self.assertEqual(
            PostInteraction.objects.filter(
                user=self.user,
                post=self.post,
                interaction_type="like",
            ).count(),
            0,
        )

    def test_repeated_unlike_does_not_drift_state(self):
        """Unlike should remain safe when no like exists."""
        response = self.client.post(self.unlike_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["data"]["removed"])
        self.assertEqual(
            PostInteraction.objects.filter(
                user=self.user,
                post=self.post,
                interaction_type="like",
            ).count(),
            0,
        )

    def test_like_then_unlike_keeps_single_state_transition(self):
        """Like then unlike should end with zero like records."""
        like_response = self.client.post(self.like_url)
        unlike_response = self.client.post(self.unlike_url)

        self.assertEqual(like_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unlike_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            PostInteraction.objects.filter(
                user=self.user,
                post=self.post,
                interaction_type="like",
            ).count(),
            0,
        )
