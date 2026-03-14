# Generated manually for messaging v1 conversation architecture.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def backfill_conversation_participants(apps, schema_editor):
    """Seed participant rows from existing conversation membership table."""

    Conversation = apps.get_model("dm_messages", "Conversation")
    Message = apps.get_model("dm_messages", "Message")
    ConversationParticipant = apps.get_model("dm_messages", "ConversationParticipant")

    through = Conversation.participants.through

    for membership in through.objects.all().iterator():
        ConversationParticipant.objects.get_or_create(
            conversation_id=membership.conversation_id,
            user_id=membership.user_id,
        )

    for conversation in Conversation.objects.all().iterator():
        last_message = (
            Message.objects.filter(conversation_id=conversation.id)
            .order_by("-created_at")
            .first()
        )
        if not last_message:
            continue

        conversation.last_message_id = last_message.id
        conversation.last_message_at = last_message.created_at
        conversation.save(update_fields=["last_message", "last_message_at"])


def noop_reverse(_apps, _schema_editor):
    """No-op reverse migration for data backfill."""


class Migration(migrations.Migration):

    dependencies = [
        ("dm_messages", "0002_message_is_read"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Thread",
            new_name="Conversation",
        ),
        migrations.RenameField(
            model_name="message",
            old_name="thread",
            new_name="conversation",
        ),
        migrations.RenameField(
            model_name="message",
            old_name="content",
            new_name="body",
        ),
        migrations.AddField(
            model_name="conversation",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="created_conversations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="conversation",
            name="last_message",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="dm_messages.message",
            ),
        ),
        migrations.AddField(
            model_name="conversation",
            name="last_message_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="conversation",
            name="type",
            field=models.CharField(
                choices=[("direct", "Direct"), ("group", "Group")],
                default="direct",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="message",
            name="deleted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="message",
            name="edited_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="message",
            name="message_type",
            field=models.CharField(
                choices=[("text", "Text")],
                default="text",
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name="conversation",
            name="participants",
            field=models.ManyToManyField(
                related_name="conversations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterModelOptions(
            name="conversation",
            options={"ordering": ["-last_message_at", "-created_at"]},
        ),
        migrations.CreateModel(
            name="ConversationParticipant",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                ("is_muted", models.BooleanField(default=False)),
                ("is_archived", models.BooleanField(default=False)),
                (
                    "conversation",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participant_rows",
                        to="dm_messages.conversation",
                    ),
                ),
                (
                    "last_read_message",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to="dm_messages.message",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="conversation_participations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-joined_at"]},
        ),
        migrations.RunPython(
            backfill_conversation_participants,
            reverse_code=noop_reverse,
        ),
        migrations.AddConstraint(
            model_name="conversationparticipant",
            constraint=models.UniqueConstraint(
                fields=("conversation", "user"),
                name="unique_conversation_participant",
            ),
        ),
        migrations.RemoveField(
            model_name="message",
            name="is_read",
        ),
    ]
