from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from drf_spectacular.utils import extend_schema

# registro de usuario, cualquiera puede acceder (AllowAny)
class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: UserSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():  # si las validaciones fallan devuelve los errores
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()  # crea el usuario y su registro de usage

        refresh = RefreshToken.for_user(user)  # generamos tokens jwt para que ya quede logueado
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),  # token de acceso
                "refresh": str(refresh),  # token de refresco
            },
            status=status.HTTP_201_CREATED,
        )


# ver y editar perfil del usuario, solo si esta logueado (IsAuthenticated)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):  # devuelve los datos del usuario logueado
        return Response(UserSerializer(request.user).data)

    def put(self, request):  # actualiza los datos del perfil
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# cambiar contraseña, solo si esta logueado
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})  # pasamos request para validar la contraseña actual
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(serializer.validated_data['password'])  # set_password hashea la nueva contraseña
        user.save()
        return Response({"detail": "Contraseña actualizada correctamente."})


# logout, mete el refresh token en la blacklist para que no se pueda usar mas
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "No se ha proporcionado el refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # invalida el token para que no sirva mas
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Logout correcto"}, status=status.HTTP_205_RESET_CONTENT)
