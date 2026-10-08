from datetime import date, timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from chats.models import Chat
from usage.models import Usage

User = get_user_model()


class ChatTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="Str0ngPassword")
        self.usage = Usage.objects.create(
            user=self.user,
            messages_used=0,
            messages_limit=2,
            reset_date=date.today() + timedelta(days=30),
        )
        self.client.force_authenticate(self.user)


class ChatCrudTests(ChatTestCase):
    def test_create_and_list_chats(self):
        response = self.client.post(reverse("chat-list-create"), {"title": "First"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(reverse("chat-list-create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([chat["title"] for chat in response.data], ["First"])

    def test_chats_are_private_to_their_owner(self):
        other = User.objects.create_user(username="bob", password="Str0ngPassword")
        chat = Chat.objects.create(user=other, title="Private")

        response = self.client.get(reverse("chat-detail", args=[chat.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_chat(self):
        chat = Chat.objects.create(user=self.user, title="Temporary")

        response = self.client.delete(reverse("chat-detail", args=[chat.id]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Chat.objects.filter(id=chat.id).exists())

    def test_endpoints_require_authentication(self):
        self.client.force_authenticate(None)
        response = self.client.get(reverse("chat-list-create"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@patch("chats.views.call_llm", return_value="Hello from the model")
class SendMessageTests(ChatTestCase):
    def setUp(self):
        super().setUp()
        self.chat = Chat.objects.create(user=self.user, title="Conversation")
        self.url = reverse("chat-detail", args=[self.chat.id])

    def test_send_message_stores_both_messages_and_counts_usage(self, mock_llm):
        response = self.client.post(self.url, {"content": "Hi"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["assistant_message"], "Hello from the model")
        self.assertEqual(
            list(self.chat.messages.values_list("role", "content")),
            [("user", "Hi"), ("assistant", "Hello from the model")],
        )
        self.usage.refresh_from_db()
        self.assertEqual(self.usage.messages_used, 1)

    def test_history_is_sent_to_the_model(self, mock_llm):
        self.client.post(self.url, {"content": "Hi"}, format="json")

        history = mock_llm.call_args.args[0]
        self.assertEqual(history, [{"role": "user", "content": "Hi"}])

    def test_message_is_rejected_when_limit_is_reached(self, mock_llm):
        self.usage.messages_used = self.usage.messages_limit
        self.usage.save()

        response = self.client.post(self.url, {"content": "Hi"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_llm.assert_not_called()

    def test_usage_is_renewed_after_the_reset_date(self, mock_llm):
        self.usage.messages_used = self.usage.messages_limit
        self.usage.reset_date = date.today() - timedelta(days=1)
        self.usage.save()

        response = self.client.post(self.url, {"content": "Hi"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usage.refresh_from_db()
        self.assertEqual(self.usage.messages_used, 1)
        self.assertGreater(self.usage.reset_date, date.today())

    def test_empty_message_is_rejected(self, mock_llm):
        response = self.client.post(self.url, {"content": ""}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_llm.assert_not_called()
