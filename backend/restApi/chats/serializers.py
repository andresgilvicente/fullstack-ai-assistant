from datetime import date, timedelta, datetime, UTC
# from dateutil.relativedelta import relativedelta

from rest_framework import serializers
from .models import Chat, ChatMessage
from django.utils import timezone
from usage.models import Usage 

# serializer para los mensajes dentro de un chat
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'chat']
        read_only_fields = ['id', 'chat']  # chat se asigna en la view, no lo manda el usuario


# serializer para los chats, incluye los mensajes anidados
class ChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)  # lista de mensajes del chat

    class Meta:
        model = Chat
        fields = ['id', 'title', 'created_at', 'user', 'messages']
        read_only_fields = ['id', 'created_at', 'user']  # user se asigna en la view con el jwt


# serializer para enviar un mensaje, aqui va la logica del limite mensual
# reglas: si supera el limite y no toca renovar se bloquea
#         si supera el limite pero ya paso la fecha de renovacion se renueva y deja enviar

class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        # usage 1-1
        try:
            usage = user.usage
        except Exception:
            raise serializers.ValidationError("No se encontró el registro de uso para este usuario.")

        now = datetime.now(UTC)

        today = now.date()  # Extraemos solo la fecha (año-mes-día)

        # Usamos 'today' en la comparación en lugar de 'now'
        if usage.reset_date is None or today >= usage.reset_date:
            usage.messages_used = 0
            # IMPORTANTE: Cambiamos timedelta(days=30) para sumarlo a 'today'
            usage.reset_date = today + timedelta(days=30) 
            usage.save(update_fields=["messages_used", "reset_date"])

        # Límite
        if usage.messages_used >= usage.messages_limit:
            raise serializers.ValidationError(
                f"Has alcanzado tu límite de {usage.messages_limit} mensajes mensuales. "
                f"Tu límite se renueva el {usage.reset_date}."
            )

        return attrs

class SendMessageResponseSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    user_message = serializers.CharField()
    assistant_message = serializers.CharField()













######################3