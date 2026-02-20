from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chat, ChatMessage
from .serializers import ChatSerializer, ChatDetailSerializer

from usage.models import Usage

# TODO: ajusta este import a donde esté en tu plantilla
# from restApi.<RUTA_REAL> import chat_llm
from restApi.chat_llm import chat_llm 


class ChatListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = Chat.objects.filter(user=request.user).order_by("-created_at")
        return Response(ChatSerializer(chats, many=True).data)

    def post(self, request):
        title = request.data.get("title", "New chat")
        chat = Chat.objects.create(user=request.user, title=title)
        return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


class ChatDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_chat(self, request, chat_id: int) -> Chat:
        return Chat.objects.get(id=chat_id, user=request.user)

    def get(self, request, chat_id: int):
        chat = self.get_chat(request, chat_id)
        return Response(ChatDetailSerializer(chat).data)

    def delete(self, request, chat_id: int):
        chat = self.get_chat(request, chat_id)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request, chat_id: int):
        """
        POST /api/chats/{chat_id}/
        Envía un mensaje del usuario y devuelve la respuesta del modelo.
        Aplica límite mensual (Usage).
        """
        chat = self.get_chat(request, chat_id)

        content = request.data.get("content")
        if not content:
            return Response({"content": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        # --- Control de uso (límite mensual) ---
        usage = Usage.objects.get(user=request.user)

        now = timezone.now()

        # Ajusta nombres de campos según tu modelo Usage:
        # - usage.messages_used
        # - usage.messages_limit
        # - usage.renew_date  (fecha en la que se resetea)
        if usage.renew_date and now >= usage.renew_date:
            usage.messages_used = 0
            # "Dentro de un mes": aquí uso 30 días como aproximación técnica.
            usage.renew_date = now + timedelta(days=30)

        if usage.messages_used >= usage.messages_limit:
            return Response(
                {"detail": "Monthly message limit reached."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Contabiliza 1 mensaje (el del usuario)
        usage.messages_used += 1
        usage.save()

        # --- Guarda mensaje del usuario ---
        ChatMessage.objects.create(chat=chat, role="user", content=content)

        # --- Llamada al LLM ---
        # La firma exacta de chat_llm depende de vuestra plantilla.
        # Ajusta el payload a lo que requiera tu función.
        llm_response = chat_llm(chat_id=chat.id, user_message=content)  # <-- puede requerir cambios

        # Si queréis persistir la respuesta del modelo:
        # (asegura que tu modelo acepte role="assistant" o el que toque)
        ChatMessage.objects.create(chat=chat, role="assistant", content=str(llm_response))

        return Response(
            {
                "chat_id": chat.id,
                "user_message": content,
                "assistant_message": llm_response,
            },
            status=status.HTTP_200_OK,
        )