from django.contrib.auth import get_user_model
from django.db.models import Q

from messages.models import Thread
from messages.services.errors import DomainNotFoundError, DomainPermissionError, DomainValidationError

User = get_user_model()


# Get or create a 1:1 thread for requester and target user.
def get_or_create_thread(user, other_user_id):
    other = User.objects.filter(id=other_user_id).first()
    if not other:
        raise DomainNotFoundError("User not found.")

    if other.id == user.id:
        raise DomainValidationError("Cannot create a thread with yourself.")

    threads = Thread.objects.filter(participants=user)
    for thread in threads:
        if thread.participants.filter(id=other.id).exists() and thread.participants.count() == 2:
            return thread, False

    thread = Thread.objects.create()
    thread.participants.add(user, other)
    return thread, True


# Fetch thread and ensure requester is a participant.
def get_participant_thread(thread_id, user):
    thread = Thread.objects.filter(id=thread_id).first()
    if not thread:
        raise DomainNotFoundError("Thread not found.")

    if not thread.participants.filter(id=user.id).exists():
        raise DomainPermissionError("Not allowed.")

    return thread


# Return DM thread previews for the requester.
def build_thread_list(user):
    threads = (
        Thread.objects.filter(participants=user)
        .prefetch_related("participants", "messages")
        .order_by("-created_at")
    )

    results = []
    for thread in threads:
        participants = [
            participant.username
            for participant in thread.participants.all()
            if participant.id != user.id
        ]
        last_message = thread.messages.order_by("-created_at").first()
        unread_count = thread.messages.filter(~Q(sender=user), is_read=False).count()
        results.append(
            {
                "thread_id": thread.id,
                "participants": participants,
                "last_message": last_message.content if last_message else "",
                "unread": unread_count,
            }
        )

    return results
