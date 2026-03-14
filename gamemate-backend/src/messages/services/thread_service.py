"""Conversation-domain business logic for direct messages."""

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q

from messages.models import Conversation, ConversationParticipant
from messages.services.errors import DomainNotFoundError, DomainPermissionError, DomainValidationError

User = get_user_model()


def _other_participants(conversation, user):
    return list(conversation.participants.exclude(id=user.id).all())


# Get or create a 1:1 direct conversation for requester and target user.
@transaction.atomic
def get_or_create_direct_conversation(user, other_user_id):
    """Return existing direct conversation or create one for two distinct users."""

    other = User.objects.filter(id=other_user_id).first()
    if not other:
        raise DomainNotFoundError("User not found.")

    if other.id == user.id:
        raise DomainValidationError("Cannot create a conversation with yourself.")

    existing = (
        Conversation.objects.filter(type=Conversation.TYPE_DIRECT, participants=user)
        .filter(participants=other)
        .annotate(participant_count=Count("participants", distinct=True))
        .filter(participant_count=2)
        .order_by("-last_message_at", "-created_at")
        .first()
    )
    if existing:
        return existing, False

    conversation = Conversation.objects.create(
        type=Conversation.TYPE_DIRECT,
        created_by=user,
    )
    conversation.participants.add(user, other)
    ConversationParticipant.objects.bulk_create(
        [
            ConversationParticipant(conversation=conversation, user=user),
            ConversationParticipant(conversation=conversation, user=other),
        ]
    )
    return conversation, True


# Fetch conversation and ensure requester is an active participant.
def get_participant_conversation(conversation_id, user):
    """Fetch a conversation and verify requester membership."""

    conversation = (
        Conversation.objects.filter(id=conversation_id)
        .prefetch_related("participants")
        .first()
    )
    if not conversation:
        raise DomainNotFoundError("Conversation not found.")

    if not conversation.participants.filter(id=user.id).exists():
        raise DomainPermissionError("Not allowed.")

    membership_row, _ = ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=user,
    )
    if membership_row.is_archived:
        raise DomainPermissionError("Conversation is archived.")

    return conversation


# Return conversation list rows for the requester.
def build_conversation_list(user):
    """Build inbox preview rows with participants, last message, and unread count."""

    conversations = (
        Conversation.objects.filter(participants=user)
        .select_related("last_message")
        .prefetch_related("participants")
        .order_by("-last_message_at", "-created_at")
    )

    results = []
    for conversation in conversations:
        participation, _ = ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=user,
        )
        if participation.is_archived:
            continue

        others = _other_participants(conversation, user)
        participant_names = [other.username for other in others]

        unread_filter = Q(conversation=conversation, deleted_at__isnull=True)
        if participation.last_read_message_id:
            unread_filter &= Q(id__gt=participation.last_read_message_id)

        unread_count = (
            conversation.messages.filter(unread_filter)
            .exclude(sender=user)
            .count()
        )

        last_message = conversation.last_message
        preview = ""
        if last_message and last_message.deleted_at:
            preview = "Message deleted"
        elif last_message:
            preview = last_message.body

        results.append(
            {
                "conversation_id": conversation.id,
                "thread_id": conversation.id,  # legacy alias for current frontend
                "type": conversation.type,
                "participants": participant_names,
                "last_message": preview,
                "last_message_at": conversation.last_message_at,
                "unread": unread_count,
            }
        )

    return results
