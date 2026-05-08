from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("", RedirectView.as_view(url="/api/docs/", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),  # schema openapi
    path("api/docs", RedirectView.as_view(url="/api/docs/", permanent=False)),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),  # swagger ui para probar endpoints
    path("api/healthcheck/", include("healthcheck.urls")),  # endpoint de healthcheck
    path(
        "api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),  # login con jwt
    path(
        "api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),  # refrescar token jwt
    path("api/users/", include("users.urls")),  # endpoints de usuarios
    path("api/usage/", include("usage.urls")),  # endpoint de uso de mensajes
    path("api/chats/", include("chats.urls")),  # endpoints de chats
]
