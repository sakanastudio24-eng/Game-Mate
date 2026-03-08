from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0001_initial"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Interaction",
            new_name="PostInteraction",
        ),
        migrations.RenameField(
            model_name="postinteraction",
            old_name="type",
            new_name="interaction_type",
        ),
        migrations.AlterField(
            model_name="postinteraction",
            name="interaction_type",
            field=models.CharField(
                choices=[
                    ("like", "Like"),
                    ("comment", "Comment"),
                    ("share", "Share"),
                    ("skip", "Skip"),
                ],
                max_length=10,
            ),
        ),
        migrations.AlterUniqueTogether(
            name="postinteraction",
            unique_together={("user", "post", "interaction_type")},
        ),
    ]
