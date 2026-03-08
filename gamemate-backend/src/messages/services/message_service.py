from messages.models import Message
from messages.services.errors import DomainPermissionError, DomainValidationError


# Send a message in a thread and emit notifications to other participants.
def send_message(thread, sender, content):
    if not thread.participants.filter(id=sender.id).exists():
        raise DomainPermissionError("Not allowed.")

    normalized_content = str(content or "").strip()
    if not normalized_content:
        raise DomainValidationError("Content is required.")

    message = Message.objects.create(
        thread=thread,
        sender=sender,
        content=normalized_content,
    )

    return message


# Return thread history and mark unread incoming messages as read.
def get_thread_messages(thread, viewer):
    Message.objects.filter(
        thread=thread,
        is_read=False,
    ).exclude(sender=viewer).update(is_read=True)

    messages = Message.objects.filter(thread=thread).select_related("sender").order_by("created_at")
    return [
        {
            "sender": message.sender.username,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at,
        }
        for message in messages
    ]
