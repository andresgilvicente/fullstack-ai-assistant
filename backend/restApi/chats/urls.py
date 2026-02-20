from django.urls import path
from .views import ChatListCreateView, ChatDetailView

urlpatterns = [
    path("", ChatListCreateView.as_view(), name="chat-list-create"),
    path("<int:chat_id>/", ChatDetailView.as_view(), name="chat-detail"),
]