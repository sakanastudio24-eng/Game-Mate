from django.conf import settings
from django.db import models


# Conversation container for direct or group chat.
class Conversation(models.Model):
    TYPE_DIRECT = "direct"
    TYPE_GROUP = "group"

    TYPE_CHOICES = [
        (TYPE_DIRECT, "Direct"),
        (TYPE_GROUP, "Group"),
    ]

    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default=TYPE_DIRECT)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_conversations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="conversations",
    )
    last_message = models.ForeignKey(
        "Message",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-last_message_at", "-created_at"]

    def __str__(self):
        return f"Conversation {self.id} ({self.type})"


# Membership/read-state row for each participant in a conversation.
class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="participant_rows",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversation_participations",
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_message = models.ForeignKey(
        "Message",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    is_muted = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "user"],
                name="unique_conversation_participant",
            )
        ]
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user.username} in conversation {self.conversation_id}"


# Message row stored in a conversation thread.
class Message(models.Model):
    TYPE_TEXT = "text"

    TYPE_CHOICES = [
        (TYPE_TEXT, "Text"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    body = models.TextField()
    message_type = models.CharField(max_length=16, choices=TYPE_CHOICES, default=TYPE_TEXT)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    @property
    def content(self):
        """Backward-compatible alias for legacy clients expecting `content`."""
        return self.body

    def __str__(self):
        return f"Message {self.id} in conversation {self.conversation_id}"
