"""Admin registrations for message threads and messages."""

from django.contrib import admin

from .models import Conversation, ConversationParticipant, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin config for direct/group conversation rows."""

    list_display = ("id", "type", "created_by", "last_message_at", "created_at")
    list_filter = ("type",)
    search_fields = ("id", "created_by__email", "created_by__username")
    ordering = ("-last_message_at", "-created_at")


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    """Admin config for participant membership/read-state rows."""

    list_display = ("id", "conversation", "user", "is_muted", "is_archived", "joined_at")
    list_filter = ("is_muted", "is_archived")
    search_fields = ("user__email", "user__username")
    ordering = ("-joined_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin config for message content, sender, and read state."""

    list_display = ("id", "conversation", "sender", "message_type", "created_at", "deleted_at")
    list_filter = ("message_type",)
    search_fields = ("sender__username", "body")
    ordering = ("-created_at",)
