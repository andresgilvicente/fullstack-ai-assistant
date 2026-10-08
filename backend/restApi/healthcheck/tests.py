from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class HealthcheckTests(APITestCase):
    def test_healthcheck_is_public(self):
        response = self.client.get(reverse("Healthcheck"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
