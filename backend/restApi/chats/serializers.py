from datetime import date, timedelta
# from dateutil.relativedelta import relativedelta

from rest_framework import serializers
from .models import Chat, ChatMessage


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
    content = serializers.CharField()  # el texto que manda el usuario

    def validate(self, attrs):
        user = self.context['request'].user  # usuario autenticado con jwt

        try:
            usage = user.usage  # registro de uso del usuario (relacion 1-1)
        except Exception:
            raise serializers.ValidationError(
                "No se encontró el registro de uso para este usuario."
            )

        today = date.today()

        if usage.messages_used >= usage.messages_limit:  # ha llegado al limite
            if today < usage.reset_date:  # todavia no toca renovar, se bloquea
                raise serializers.ValidationError(
                    f"Has alcanzado tu límite de {usage.messages_limit} mensajes mensuales. "
                    f"Tu límite se renueva el {usage.reset_date}."
                )

            # ya paso la fecha de renovacion, reiniciamos el contador
            usage.messages_used = 0
            usage.reset_date = today + timedelta(days=30)  # nueva fecha +1 mes
            usage.save()

        return attrs
