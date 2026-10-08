from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthcheckView(APIView):
    @extend_schema(
        description="Healthcheck endpoint",
        responses={200: str},
    )
    def get(self, request):
        return Response("AI Chat Assistant API is running")
