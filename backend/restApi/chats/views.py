from datetime import date  # si no lo usas, puedes quitarlo

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chat, ChatMessage
from .serializers import ChatSerializer, SendMessageSerializer

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
        return Chat.objects.get(id=chat_id, user=request.user)

    def get(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        return Response(ChatSerializer(chat).data)

    def delete(self, request, chat_id):
        chat = self.get_chat(request, chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, chat_id):
        chat = self.get_chat(request, chat_id)

        serializer = SendMessageSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        content = serializer.validated_data['content']

        # incrementa uso (el serializer ya hizo el control de límite y reset)
        usage = request.user.usage
        usage.messages_used += 1
        usage.save()

        # guarda mensaje usuario
        ChatMessage.objects.create(chat=chat, role="user", content=content)

        # historial: requiere que related_name en ChatMessage sea "messages"
        messages = list(chat.messages.values("role", "content"))

        llm_response = call_llm(messages)

        # guarda respuesta del assistant
        ChatMessage.objects.create(chat=chat, role="assistant", content=llm_response)

        return Response(
            {
                "chat_id": chat.id,
                "user_message": content,
                "assistant_message": llm_response,
            },
            status=status.HTTP_200_OK,
        )
    






