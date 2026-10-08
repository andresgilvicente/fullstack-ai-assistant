from django.conf import settings
from django.db import models


class Chat(models.Model):
    """A conversation between a user and the assistant."""

    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chats",
    )

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    class Meta:
        verbose_name = "Chat"
        verbose_name_plural = "Chats"


class ChatMessage(models.Model):
    """A single message inside a chat, written by the user or the assistant."""

    ROLE_CHOICES = [
        ("user", "user"),
        ("assistant", "assistant"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
