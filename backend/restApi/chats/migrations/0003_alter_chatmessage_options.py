from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("chats", "0002_alter_chatmessage_role"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="chatmessage",
            options={"verbose_name": "Message", "verbose_name_plural": "Messages"},
        ),
    ]
