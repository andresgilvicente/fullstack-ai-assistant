from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Usage
from .serializers import UsageSerializer


class UsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usage = Usage.objects.get(user=request.user)
        return Response(UsageSerializer(usage).data)