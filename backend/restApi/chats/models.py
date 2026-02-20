from django.db import models
from django.conf import settings


class Chat(models.Model):
    """
    Modelo que representa una conversación del usuario con la IA.
    Relación: 1 User → N Chats (un usuario puede tener muchos chats).
    """

    # Título del chat (ej: "Ayuda con Python", "Recetas de cocina")
    title = models.CharField(max_length=255)

    # Fecha y hora en la que se creó el chat.
    # auto_now_add=True → Django la pone automáticamente al crear el registro
    created_at = models.DateTimeField(auto_now_add=True)

    # Relación muchos-a-uno con User:
    # - ForeignKey: muchos chats pueden pertenecer a un usuario
    # - CASCADE: si se borra el usuario, se borran todos sus chats
    # - related_name="chats": permite hacer user.chats.all() desde el usuario
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
    """
    Modelo que representa un mensaje dentro de un chat.
    Relación: 1 Chat → N ChatMessages (un chat tiene muchos mensajes).

    El campo 'role' indica quién escribió el mensaje:
    - "user": lo escribió el usuario
    - "system": lo respondió la IA
    """

    # Opciones válidas para el campo role
    ROLE_CHOICES = [
        ("user", "user"),       # Mensaje del usuario
        ("system", "system"),   # Respuesta de la IA
    ]

    # Quién escribió el mensaje: "user" o "system"
    # choices=ROLE_CHOICES → restringe a solo esos dos valores
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # El texto del mensaje (TextField porque puede ser largo)
    content = models.TextField()

    # Relación muchos-a-uno con Chat:
    # - ForeignKey: muchos mensajes pertenecen a un chat
    # - CASCADE: si se borra el chat, se borran todos sus mensajes
    # - related_name="messages": permite hacer chat.messages.all()
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"

    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
