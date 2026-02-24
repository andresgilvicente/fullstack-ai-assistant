from datetime import date  # si no lo usas, puedes quitarlo

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from django.db import transaction

from .models import Chat, ChatMessage
from .serializers import ChatSerializer, SendMessageSerializer, SendMessageResponseSerializer

from ai.llm_service import call_llm

class ChatListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = Chat.objects.filter(user=request.user).order_by("-created_at")
        return Response(ChatSerializer(chats, many=True).data)

    def post(self, request):
        title = request.data.get("title", "Nuevo chat")
        chat = Chat.objects.create(user=request.user, title=title)
        return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


class ChatDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_chat(self, request, chat_id):
        return get_object_or_404(Chat, id=chat_id, user=request.user)

    def get(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        return Response(ChatSerializer(chat).data)

    def delete(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(request=SendMessageSerializer, responses={200: SendMessageResponseSerializer})
    def post(self, request, chat_id):
        chat = self.get_chat(request, chat_id)

        serializer = SendMessageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        content = serializer.validated_data["content"]

        with transaction.atomic():
            # guarda mensaje usuario
            ChatMessage.objects.create(chat=chat, role="user", content=content)

            # incrementa uso
            usage = request.user.usage
            usage.messages_used += 1
            usage.save(update_fields=["messages_used"])

            # historial
            messages = list(chat.messages.values("role", "content"))

            # llama LLM
            llm_response = call_llm(messages)

            # guarda respuesta assistant
            ChatMessage.objects.create(chat=chat, role="assistant", content=llm_response)

        return Response(
            {
                "chat_id": chat.id,
                "user_message": content,
                "assistant_message": llm_response,
            },
            status=status.HTTP_200_OK,
        )




    ##############################################
        ##############################################
            ##############################################
                ##############################################
                    ##############################################
                        ##############################################
                            ##############################################
                                ##############################################

    





