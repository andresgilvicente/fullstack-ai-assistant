from datetime import date
from dateutil.relativedelta import relativedelta

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chat, ChatMessage
from .serializers import ChatSerializer, SendMessageSerializer
from usage.models import Usage

# TODO: ajusta este import a donde esté en tu plantilla
# from restApi.<RUTA_REAL> import chat_llm
from restApi.chat_llm import chat_llm 


# listar todos los chats del usuario y crear uno nuevo
class ChatListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):  # devuelve todos los chats del usuario ordenados por fecha
        chats = Chat.objects.filter(user=request.user).order_by("-created_at")
        return Response(ChatSerializer(chats, many=True).data)

    def post(self, request):  # crea un chat nuevo con el titulo que mande el usuario
        title = request.data.get("title", "Nuevo chat")
        chat = Chat.objects.create(user=request.user, title=title)
        return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


# ver detalle de un chat, borrarlo o enviar un mensaje
class ChatDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_chat(self, request, chat_id):  # metodo auxiliar para buscar un chat del usuario
        return Chat.objects.get(id=chat_id, user=request.user)

    def get(self, request, chat_id):  # devuelve el chat con todos sus mensajes
        chat = self.get_chat(request, chat_id)
        return Response(ChatSerializer(chat).data)

    def delete(self, request, chat_id):  # borra el chat y todos sus mensajes en cascada
        chat = self.get_chat(request, chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, chat_id):  # envia un mensaje al llm y guarda la respuesta
        chat = self.get_chat(request, chat_id)

        # validamos con el serializer que tiene la logica del limite mensual
        serializer = SendMessageSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        content = serializer.validated_data['content']

        # sumamos 1 al contador de mensajes usados
        usage = request.user.usage
        usage.messages_used += 1
        usage.save()

        # guardamos el mensaje del usuario en la bd
        ChatMessage.objects.create(chat=chat, role="user", content=content)

        # preparamos el historial de mensajes para el llm
        messages = list(chat.messages.values("role", "content"))  # sacamos todos los mensajes del chat

        # llamamos al llm y guardamos su respuesta
        llm_response = call_llm(messages)
        ChatMessage.objects.create(chat=chat, role="system", content=llm_response)

        return Response(
            {
                "chat_id": chat.id,
                "user_message": content,
                "assistant_message": llm_response,
            },
            status=status.HTTP_200_OK,
        )
