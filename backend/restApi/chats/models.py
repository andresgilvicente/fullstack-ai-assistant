from django.db import models
from django.conf import settings


# modelo de chat, representa una conversacion del usuario con la ia
# relacion 1 user a n chats
class Chat(models.Model):
    title = models.CharField(max_length=255)  # titulo del chat
    created_at = models.DateTimeField(auto_now_add=True)  # se pone solo al crear
    user = models.ForeignKey(  # muchos chats pertenecen a un usuario
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # si se borra el usuario se borran sus chats
        related_name="chats",  # para poder hacer user.chats.all()
    )

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    class Meta:
        verbose_name = "Chat"
        verbose_name_plural = "Chats"


# modelo de mensaje dentro de un chat
# relacion 1 chat a n mensajes
class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "user"),  # mensaje del usuario
        ("assistant", "assistant"),  # respuesta de la ia
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)  # quien habla
    content = models.TextField()  # texto del mensaje
    chat = models.ForeignKey(  # muchos mensajes pertenecen a un chat
        Chat,
        on_delete=models.CASCADE,  # si se borra el chat se borran sus mensajes
        related_name="messages",  # para poder hacer chat.messages.all()
    )

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"

    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
