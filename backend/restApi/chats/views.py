from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai.llm_service import call_llm

from .models import Chat, ChatMessage
from .serializers import (
    ChatSerializer,
    SendMessageResponseSerializer,
    SendMessageSerializer,
)


class ChatListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: ChatSerializer(many=True)})
    def get(self, request):
        chats = Chat.objects.filter(user=request.user).order_by("-created_at")
        return Response(ChatSerializer(chats, many=True).data)

    @extend_schema(responses={201: ChatSerializer})
    def post(self, request):
        title = request.data.get("title", "New chat")
        chat = Chat.objects.create(user=request.user, title=title)
        return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


class ChatDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_chat(self, request, chat_id):
        return get_object_or_404(Chat, id=chat_id, user=request.user)

    @extend_schema(responses={200: ChatSerializer})
    def get(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        return Response(ChatSerializer(chat).data)

    @extend_schema(responses={204: None})
    def delete(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        request=SendMessageSerializer,
        responses={200: SendMessageResponseSerializer},
    )
    def post(self, request, chat_id):
        chat = self.get_chat(request, chat_id)

        serializer = SendMessageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        content = serializer.validated_data["content"]

        with transaction.atomic():
            ChatMessage.objects.create(chat=chat, role="user", content=content)

            usage = request.user.usage
            usage.messages_used += 1
            usage.save(update_fields=["messages_used"])

            history = list(chat.messages.values("role", "content"))
            reply = call_llm(history)

            ChatMessage.objects.create(chat=chat, role="assistant", content=reply)

        return Response(
            {
                "chat_id": chat.id,
                "user_message": content,
                "assistant_message": reply,
            },
            status=status.HTTP_200_OK,
        )
