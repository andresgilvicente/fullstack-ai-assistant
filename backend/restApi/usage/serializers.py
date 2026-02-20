from rest_framework import serializers
from .models import Usage


# serializer para ver el uso de mensajes del usuario, todo es solo lectura
class UsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usage
        fields = ['id', 'messages_used', 'messages_limit', 'reset_date']
        read_only_fields = ['id', 'messages_used', 'messages_limit', 'reset_date']
