from django.urls import path
from .views import UserRegisterView, UserProfileView, ChangePasswordView, LogoutView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),  # registrar usuario nuevo
    path("profile", UserProfileView.as_view(), name="profile"),  # ver y editar perfil
    path("profile/password", ChangePasswordView.as_view(), name="profile-password"),  # cambiar contraseña
    path("logout", LogoutView.as_view(), name="logout"),  # cerrar sesion
]
