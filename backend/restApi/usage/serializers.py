from rest_framework import serializers

from .models import Usage


class UsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usage
        fields = ["id", "messages_used", "messages_limit", "reset_date"]
        read_only_fields = ["id", "messages_used", "messages_limit", "reset_date"]
