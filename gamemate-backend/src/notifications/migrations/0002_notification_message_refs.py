# Generated manually to support message deep-link notification fields.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="notification",
            name="conversation_id",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="notification",
            name="message_id",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
