from django.urls import path
from .views import UsageView

urlpatterns = [
    path("", UsageView.as_view(), name="usage"),  # ver uso de mensajes del usuario
]
