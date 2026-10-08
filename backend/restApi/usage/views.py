from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Usage
from .serializers import UsageSerializer


class UsageView(APIView):
    """Return the message usage of the authenticated user."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UsageSerializer})
    def get(self, request):
        usage, _ = Usage.objects.get_or_create(user=request.user)
        return Response(UsageSerializer(usage).data)
