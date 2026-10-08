from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UsageViewTests(APITestCase):
    def test_requires_authentication(self):
        response = self.client.get(reverse("usage"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_usage_record_is_created_on_first_access(self):
        user = User.objects.create_user(username="alice", password="Str0ngPassword")
        self.client.force_authenticate(user)

        response = self.client.get(reverse("usage"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["messages_used"], 0)
        self.assertEqual(response.data["messages_limit"], 100)
