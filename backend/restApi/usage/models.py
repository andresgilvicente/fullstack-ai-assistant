from django.db import models
from django.conf import settings


class Usage(models.Model):
    """
    Modelo que controla el uso de mensajes de cada usuario.
    Cada usuario tiene UN solo registro de Usage (relación 1-1).

    Funciona como un "contador mensual":
    - messages_used: cuántos mensajes ha enviado este mes
    - messages_limit: cuántos puede enviar como máximo al mes
    - reset_date: fecha en la que el contador se reinicia a 0
    """

    # Número de mensajes que el usuario ha enviado en el período actual
    messages_used = models.IntegerField(default=0)

    # Límite máximo de mensajes que puede enviar por período (por defecto 100)
    messages_limit = models.IntegerField(default=100)

    # Fecha en la que se reinicia el contador de mensajes (se renueva cada mes)
    reset_date = models.DateField()

    # Relación 1-1 con el usuario.
    # - CASCADE: si se borra el usuario, se borra su Usage también.
    # - related_name="usage": permite acceder desde el usuario con user.usage
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage",
    )

    def __str__(self):
        """Representación legible del objeto (útil en el admin de Django)."""
        return f"Usage de {self.user.username}: {self.messages_used}/{self.messages_limit}"

    class Meta:
        """Configuración extra del modelo."""
        verbose_name = "Uso"
        verbose_name_plural = "Usos"
