from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    """
    Modelo de usuario personalizado.
    Hereda de AbstractUser que ya incluye:
    - username, email, password
    - first_name, last_name
    - is_active, is_staff, date_joined
    """
    pass  # Por ahora no añadimos campos extra
