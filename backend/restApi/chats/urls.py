from django.urls import path

from .views import ChatDetailView, ChatListCreateView

urlpatterns = [
    path("", ChatListCreateView.as_view(), name="chat-list-create"),
    path("<int:chat_id>/", ChatDetailView.as_view(), name="chat-detail"),
]
