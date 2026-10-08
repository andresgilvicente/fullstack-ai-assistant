from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("usage", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="usage",
            options={"verbose_name": "Usage", "verbose_name_plural": "Usages"},
        ),
    ]
