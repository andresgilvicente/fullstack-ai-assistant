from django.urls import path
from .views import ChatListCreateView, ChatDetailView

urlpatterns = [
    path("", ChatListCreateView.as_view(), name="chat-list-create"),  # listar y crear chats
    path("<int:chat_id>/", ChatDetailView.as_view(), name="chat-detail"),  # ver, borrar o enviar mensaje en un chat
]
