"""Message-domain business logic helpers."""

from django.utils import timezone

from messages.models import ConversationParticipant, Message
from messages.services.errors import DomainPermissionError, DomainValidationError


MAX_MESSAGE_LENGTH = 2000


def _ensure_participant(conversation, user):
    membership = ConversationParticipant.objects.filter(
        conversation=conversation,
        user=user,
        is_archived=False,
    ).first()
    if not membership:
        raise DomainPermissionError("Not allowed.")
    return membership


# Send a message in a conversation and update conversation summary/read pointer.
def send_message(conversation, sender, body):
    """Validate participant access and persist one message in a conversation."""

    sender_membership = _ensure_participant(conversation, sender)

    normalized_body = str(body or "").strip()
    if not normalized_body:
        raise DomainValidationError("Content is required.")
    if len(normalized_body) > MAX_MESSAGE_LENGTH:
        raise DomainValidationError(f"Content exceeds {MAX_MESSAGE_LENGTH} characters.")

    message = Message.objects.create(
        conversation=conversation,
        sender=sender,
        body=normalized_body,
        message_type=Message.TYPE_TEXT,
    )

    conversation.last_message = message
    conversation.last_message_at = message.created_at
    conversation.save(update_fields=["last_message", "last_message_at"])

    # Sender has read up to the message they just sent.
    sender_membership.last_read_message = message
    sender_membership.save(update_fields=["last_read_message"])

    return message


# Mark conversation as read for viewer and return read pointer.
def mark_conversation_read(conversation, viewer):
    """Mark latest conversation message as read for the viewer."""

    membership = _ensure_participant(conversation, viewer)
    latest = (
        conversation.messages.filter(deleted_at__isnull=True)
        .order_by("-id")
        .first()
    )
    membership.last_read_message = latest
    membership.save(update_fields=["last_read_message"])
    return latest


# Return conversation history; optional read-marker update.
def get_conversation_messages(conversation, viewer, mark_read=True):
    """Return ordered history and mark viewer read pointer to latest message."""

    _ensure_participant(conversation, viewer)

    messages = (
        Message.objects.filter(conversation=conversation)
        .select_related("sender")
        .order_by("created_at")
    )
    payload = [
        {
            "id": message.id,
            "sender_id": message.sender_id,
            "sender": message.sender.username,
            "body": "" if message.deleted_at else message.body,
            "content": "" if message.deleted_at else message.body,  # legacy alias
            "message_type": message.message_type,
            "is_deleted": bool(message.deleted_at),
            "created_at": message.created_at,
            "edited_at": message.edited_at,
            "deleted_at": message.deleted_at,
        }
        for message in messages
    ]

    if mark_read:
        mark_conversation_read(conversation, viewer)

    return payload


# Soft-delete one message sent by requester.
def soft_delete_message(conversation, requester, message_id):
    """Soft delete a message and keep thread integrity."""

    _ensure_participant(conversation, requester)
    message = Message.objects.filter(conversation=conversation, id=message_id).first()
    if not message:
        raise DomainValidationError("Message not found.")
    if message.sender_id != requester.id:
        raise DomainPermissionError("Only sender can delete this message.")
    if message.deleted_at:
        return message

    message.deleted_at = timezone.now()
    message.save(update_fields=["deleted_at"])
    return message
