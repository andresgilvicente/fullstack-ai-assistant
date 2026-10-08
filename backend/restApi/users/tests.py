from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

VALID_PAYLOAD = {
    "username": "alice",
    "email": "alice@example.com",
    "password": "Str0ngPassword",
    "password2": "Str0ngPassword",
    "first_name": "Alice",
    "last_name": "Smith",
}


class RegistrationTests(APITestCase):
    def test_register_creates_user_usage_and_tokens(self):
        response = self.client.post(reverse("register"), VALID_PAYLOAD, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        user = User.objects.get(username="alice")
        self.assertEqual(user.usage.messages_used, 0)
        self.assertEqual(user.usage.messages_limit, 100)

    def test_register_rejects_mismatched_passwords(self):
        payload = {**VALID_PAYLOAD, "password2": "Different1Password"}
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password2", response.data)

    def test_register_rejects_weak_password(self):
        payload = {**VALID_PAYLOAD, "password": "weak", "password2": "weak"}
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_rejects_duplicate_username(self):
        self.client.post(reverse("register"), VALID_PAYLOAD, format="json")
        payload = {**VALID_PAYLOAD, "email": "other@example.com"}
        response = self.client.post(reverse("register"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)


class AuthenticatedUserTests(APITestCase):
    def setUp(self):
        response = self.client.post(reverse("register"), VALID_PAYLOAD, format="json")
        self.access = response.data["access"]
        self.refresh = response.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

    def test_profile_requires_authentication(self):
        self.client.credentials()
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_and_update_profile(self):
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "alice")

        response = self.client.put(reverse("profile"), {"username": "alice2"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "alice2")

    def test_change_password(self):
        payload = {
            "old_password": "Str0ngPassword",
            "password": "NewStr0ngPassword",
            "password2": "NewStr0ngPassword",
        }
        response = self.client.put(reverse("profile-password"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.get(username="alice").check_password("NewStr0ngPassword"))

    def test_change_password_rejects_wrong_current_password(self):
        payload = {
            "old_password": "WrongPassword1",
            "password": "NewStr0ngPassword",
            "password2": "NewStr0ngPassword",
        }
        response = self.client.put(reverse("profile-password"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)

    def test_logout_blacklists_refresh_token(self):
        response = self.client.post(reverse("logout"), {"refresh": self.refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        response = self.client.post(reverse("token_refresh"), {"refresh": self.refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_refresh_token(self):
        response = self.client.post(reverse("logout"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
