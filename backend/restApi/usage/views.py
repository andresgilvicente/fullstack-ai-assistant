from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Usage
from .serializers import UsageSerializer


# devuelve el uso de mensajes del usuario logueado
class UsageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usage = Usage.objects.get(user=request.user)  # pillamos el registro de uso del usuario
        return Response(UsageSerializer(usage).data)
