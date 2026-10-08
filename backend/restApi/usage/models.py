from datetime import date, timedelta

from django.conf import settings
from django.db import models


def get_default_reset_date():
    return date.today() + timedelta(days=30)


class Usage(models.Model):
    """Monthly message quota of a user (one-to-one with the user)."""

    messages_used = models.IntegerField(default=0)
    messages_limit = models.IntegerField(default=100)
    reset_date = models.DateField(default=get_default_reset_date)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage",
        null=True,
    )

    def __str__(self):
        return f"Usage of {self.user.username}: {self.messages_used}/{self.messages_limit}"

    class Meta:
        verbose_name = "Usage"
        verbose_name_plural = "Usages"
