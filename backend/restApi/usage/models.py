from django.db import models
from django.conf import settings
from datetime import date, timedelta

def get_default_reset_date():
    return date.today() + timedelta(days=30)

# controla el uso de mensajes de cada usuario, relacion 1 a 1 con user
class Usage(models.Model):
    messages_used = models.IntegerField(default=0)  # mensajes enviados este mes
    messages_limit = models.IntegerField(default=100)  # maximo de mensajes al mes
    reset_date = models.DateField(default=get_default_reset_date) # fecha en la que se reinicia el contador
    user = models.OneToOneField(  # relacion 1-1 con user, si se borra el user se borra su usage
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage",
        null=True
    )

    def __str__(self):
        return f"Usage de {self.user.username}: {self.messages_used}/{self.messages_limit}"

    class Meta:
        verbose_name = "Uso"
        verbose_name_plural = "Usos"
