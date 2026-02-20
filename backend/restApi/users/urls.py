from django.urls import path
from .views import UserRegisterView, UserProfileView, ChangePasswordView, LogoutView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="register"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("profile/password/", ChangePasswordView.as_view(), name="profile-password"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
