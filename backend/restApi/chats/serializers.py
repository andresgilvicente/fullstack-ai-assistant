from datetime import UTC, datetime, timedelta

from rest_framework import serializers

from .models import Chat, ChatMessage

USAGE_RESET_PERIOD = timedelta(days=30)


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "chat"]
        read_only_fields = ["id", "chat"]


class ChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "created_at", "user", "messages"]
        read_only_fields = ["id", "created_at", "user"]


class SendMessageSerializer(serializers.Serializer):
    """
    Validate a new user message against the monthly usage quota.

    If the reset date has passed, the counter is renewed before the check.
    Otherwise, a user who has reached the limit is rejected.
    """

    content = serializers.CharField()

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("User is not authenticated.")

        try:
            usage = user.usage
        except Exception:
            raise serializers.ValidationError("No usage record found for this user.")

        today = datetime.now(UTC).date()

        if usage.reset_date is None or today >= usage.reset_date:
            usage.messages_used = 0
            usage.reset_date = today + USAGE_RESET_PERIOD
            usage.save(update_fields=["messages_used", "reset_date"])

        if usage.messages_used >= usage.messages_limit:
            raise serializers.ValidationError(
                f"You have reached your monthly limit of {usage.messages_limit} messages. "
                f"Your limit resets on {usage.reset_date}."
            )

        return attrs


class SendMessageResponseSerializer(serializers.Serializer):
    chat_id = serializers.IntegerField()
    user_message = serializers.CharField()
    assistant_message = serializers.CharField()
